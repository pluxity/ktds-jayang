package com.pluxity.ktds.domains.building.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pluxity.ktds.domains.building.dto.*;
import com.pluxity.ktds.domains.building.entity.*;
import com.pluxity.ktds.domains.building.repostiory.*;
import com.pluxity.ktds.domains.patrol.entity.Patrol;
import com.pluxity.ktds.domains.patrol.entity.PatrolPoint;
import com.pluxity.ktds.domains.patrol.repository.PatrolPointRepository;
import com.pluxity.ktds.domains.patrol.repository.PatrolRepository;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static com.pluxity.ktds.global.constant.ErrorCode.*;
import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Slf4j
public class BuildingService {
    private final BuildingRepository buildingRepository;
    private final FileInfoService fileIoService;
    private final SaveZipFile saveZipFile;
    private final FileInfoRepository fileInfoRepository;
    private final PoiRepository poiRepository;
    private final PatrolRepository patrolRepository;
    private final PatrolPointRepository patrolPointRepository;
    private final FloorRepository floorRepository;
    private final FloorHistoryRepository floorHistoryRepository;

    @Value("${root-path.upload}")
    private String uploadRootPath;

    private final BuildingFileHistoryRepository buildingFileHistoryRepository;

    @Transactional(readOnly = true)
    public BuildingDetailResponseDTO findById(@NotNull final Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));
        return building.toDetailResponseDTO();
    }

    @Transactional(readOnly = true)
    public List<BuildingResponseDTO> findAll() {
        return buildingRepository.findAllByIsIndoor("Y").stream()
                .map(Building::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BuildingDetailResponseDTO> findDetailAll() {
        return buildingRepository.findAllByIsIndoor("Y").stream()
                .filter(building -> !"store".equals(building.getCode()))
                .map(Building::toDetailResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public BuildingDetailResponseDTO findOutdoorDetail() {

        Building building = buildingRepository.findTop1ByIsIndoorOrderByIdDesc("N")
                .orElse(null);
        if (building == null) {
            return null;
        }
        return building.toDetailResponseDTO();
    }

    @Transactional(readOnly = true)
    public BuildingDetailResponseDTO findStoreDetail() {

        Building building = buildingRepository.findByCode("store")
                .orElse(null);
        if (building == null) {
            return null;
        }
        return building.toDetailResponseDTO();
    }

    @Transactional(readOnly = true)
    public List<BuildingDetailResponseDTO> findParkDetail() {

        return buildingRepository.findByCodeContaining("park").stream()
                .map(Building::toDetailResponseDTO)
                .toList();
    }

    @Transactional
    public FileInfoDTO saveFile(@NotNull final MultipartFile file) throws IOException {
        return saveZipFileAndGetFileInfo(file);
    }

    // building 등록용
    @Transactional
    public FileInfoDTO saveFile(@NotNull final MultipartFile file, String version) throws IOException {
        return fileIoService.saveFile(file, FileEntityType.BUILDING, saveZipFile, version);
    }

    // history 등록용
    @Transactional
    public FileInfoDTO saveFile(@NotNull final MultipartFile file, String version, Long buildingId) throws IOException {

        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));
        return fileIoService.saveFile(file, FileEntityType.BUILDING, saveZipFile, version, building.getFileInfo().getDirectoryName());
    }

    @Transactional
    public Long saveBuilding(@NotNull final CreateBuildingDTO dto) {
        validateDuplicationCode(dto);
        FileInfo fileInfo = getFileInfo(dto.fileInfoId());
        Building building = createBuildingByDto(dto, fileInfo);

        List<Floor> floors = createFloors(fileInfo, dto.version());

        for (Floor floor : floors) {
            building.addFloor(floor);
        }

        createHistory(fileInfo, building, dto.version());

        buildingRepository.save(building);

        return building.getId();
    }

    private Building getBuildingById(Long id) {
        return buildingRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_BUILDING);
        });
    }


    @Transactional
    public Long updateBuilding(@NotNull Long id, @NotNull UpdateBuildingDTO dto) {
        validateDuplicationCode(id, dto.code());

        BuildingFileHistory updateHistory = buildingFileHistoryRepository.findById(dto.historyId())
                .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));

        Building building = getBuildingById(id);

        // 버전 변경인 경우 evacuationRoute 업데이트
        if (!building.getActiveVersion().equals(updateHistory.getBuildingVersion())) {
            updateEvacuationRouteForNewVersion(building, updateHistory);
        }

        building.changeActiveVersion(updateHistory.getBuildingVersion());
        building.changeFileInfo(getFileInfo(updateHistory.getFileInfo().getId()));

        building.update(dto);
        return id;
    }

    /**
     * 새로운 버전에 맞게 evacuationRoute의 floor 정보를 업데이트
     */
    private void updateEvacuationRouteForNewVersion(Building building, BuildingFileHistory newHistory) {
        String currentEvacuationRoute = building.getEvacuationRoute();
        if (currentEvacuationRoute == null || currentEvacuationRoute.isEmpty()) {
            return;
        }

        try {
            // JSON 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode evacuationRouteJson = objectMapper.readTree(currentEvacuationRoute);

            // points 배열의 각 요소 업데이트
            JsonNode points = evacuationRouteJson.get("points");
            if (points != null && points.isArray()) {
                for (JsonNode point : points) {
                    String currentFloorId = point.get("floorId").asText();

                    // 현재 floor 정보로 새로운 버전의 floor 정보 조회
                    FloorInfo newFloorInfo = getFloorInfoForNewVersion(
                            building.getId(),
                            currentFloorId,
                            newHistory.getId()
                    );

                    log.info("newFloorInfo = {}", newFloorInfo.toString());

                    if (newFloorInfo != null) {
                        // JSON 노드 업데이트
                        ((ObjectNode) point).put("floorId", newFloorInfo.floorId());
                        ((ObjectNode) point).put("floorDisplayName", newFloorInfo.floorDisplayName());
                        ((ObjectNode) point).put("floorBaseFloor", newFloorInfo.floorBaseFloor());
                    }
                }
            }

            // 업데이트된 JSON을 building에 설정
            String updatedEvacuationRoute = objectMapper.writeValueAsString(evacuationRouteJson);
            building.changeEvacuationRoute(updatedEvacuationRoute);

        } catch (Exception e) {
            log.error("updateEvacuationRouteForNewVersion error : {}", e.getMessage());
        }
    }

    /**
     * 새로운 버전의 floor 정보를 조회
     */
    private FloorInfo getFloorInfoForNewVersion(Long buildingId, String currentFloorId, Long newHistoryId) {
        return floorRepository.findFloorInfoForNewVersion(buildingId, Long.valueOf(currentFloorId), newHistoryId)
                .stream()
                .findFirst()
                .orElse(null);
    }


//    @Transactional
//    public Long updateForceBuilding(@NotNull final Long id, @NotNull final UpdateBuildingDTO dto) {
//        validateDuplicationCode(id, dto.code());
//
//        Building building = getBuildingById(id);
//        FileInfo fileInfo = getFileInfo(dto.fileInfoId());
//        updateFields(dto, building, fileInfo);
//        return building.getId();
//    }
//
//    private void updateFields(UpdateBuildingDTO dto, Building building, FileInfo fileInfo) {
//        if (fileInfo != null) {
//            building.changeFileInfo(fileInfo);
//            updateFloor(fileInfo, building);
////            createHistory(fileInfo, building);
//        }
//        building.update(dto);
//
//    }

    @Transactional
    public void delete(@NotNull final Long id) {
        Building building = getBuildingById(id);

        // 1. 먼저 연관된 모든 엔티티들을 삭제
        List<BuildingFileHistory> buildingFileHistories = buildingFileHistoryRepository.findByBuildingId(building.getId());
        
        // FloorHistory 먼저 삭제(floor는 cascade로 삭제)
        floorHistoryRepository.deleteByBuildingFileHistoryIdIn(buildingFileHistories.stream()
                .map(BuildingFileHistory::getId)
                .toList());
        
        // BuildingFileHistory 삭제
        buildingFileHistoryRepository.deleteAll(buildingFileHistories);

        // Patrol 관련 삭제
        List<Patrol> patrols = patrolRepository.findByBuildingId(building.getId());
        if (!patrols.isEmpty()) {
            for (Patrol patrol : patrols) {
                List<PatrolPoint> patrolPoints = patrolPointRepository.findByPatrolId(patrol.getId());
                patrolPointRepository.deleteAll(patrolPoints);
            }
            patrolRepository.deleteByBuildingId(building.getId());
        }

        // POI 삭제
        List<Poi> pois = poiRepository.findPoisByBuildingId(building.getId());
        if (!pois.isEmpty()) {
            poiRepository.deleteAll(pois);
        }

        // 2. 마지막으로 Building 삭제
        buildingRepository.delete(building);
    }

    @Transactional
    public void updateLod(Long id, LodSettings lodSettings) {
        buildingRepository.findById(id)
                .map(building -> {
                    building.changeLodSettings(lodSettings);
                    return building.getId();
                })
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));
    }

    @Transactional
    public void updateEvacuationRoute(Long id, String evacuationRoute) {
        buildingRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING))
                .changeEvacuationRoute(evacuationRoute);
    }

    @Transactional
    public void updateTopology(Long id, String topology) {
        buildingRepository.findById(id)
                .map(building -> {
                    building.changeTopology(topology);
                    return building.getId();
                })
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));
    }

    @Transactional
    public void deleteAll(List<Long> ids) {
        for (Long id : ids) {
            this.delete(id);
        }
    }

    private static Building createBuildingByDto(CreateBuildingDTO dto, FileInfo fileInfo) {
        Building building = Building.builder()
                .code(dto.code())
                .name(dto.name())
                .description(dto.description())
                .isIndoor(dto.isIndoor())
                .activeVersion(dto.version())
                .build();
        building.changeFileInfo(fileInfo);
        return building;
    }

    private FileInfo getFileInfo(Long fileInfoId) {
        return fileInfoRepository.findById(fileInfoId).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_plx_file);
        });
    }


    private void validationFile(FileInfo fileInfo, Building building) {
        Path fileInfoPath = Path.of(uploadRootPath, fileInfo.getFileEntityType(), fileInfo.getDirectoryName());
        Path buildingFilePath = Path.of(uploadRootPath, fileInfo.getFileEntityType(), building.getFileInfo().getDirectoryName());


        String newTitle = getTitleFromXml(findXmlFileName(fileInfoPath));
        String oldTitle = getTitleFromXml(findXmlFileName(buildingFilePath));

        if (!newTitle.equals(oldTitle)) {
            throw new CustomException(INVALID_XML_TITLE);
        }

        List<String> beforeSbm = getSbmFiles(buildingFilePath);
        List<String> afterSbm = getSbmFiles(fileInfoPath);

        if (beforeSbm.size() != afterSbm.size()) {
            throw new CustomException(NOT_MATCH_SBM_FILE);
        }
    }

    private static List<String> getSbmFiles(Path directoryPath) {
        return Arrays.stream(Objects.requireNonNull(directoryPath.toFile().list()))
                .filter(s -> s.endsWith(".sbm")).toList();
    }

    private String getTitleFromXml(Path xmlFilePath) {
        return getDocument(xmlFilePath.toString())
                .getElementsByTagName("Title")
                .item(0)
                .getTextContent();
    }

    private void createHistory(FileInfo fileInfo, Building building, String version) {
        BuildingFileHistory history = BuildingFileHistory.builder()
                .building(building)
                .fileInfo(fileInfo)
                .buildingVersion(version)
                .build();

        history = buildingFileHistoryRepository.save(history);

        List<Floor> floors = building.getFloors();
        for (Floor floor : floors) {
            FloorHistory floorHistory = FloorHistory.builder()
                    .floor(floor)
                    .buildingFileHistory(history)
                    .build();

            floorHistoryRepository.save(floorHistory);
        }
    }

//    private void updateFloor(FileInfo fileInfo, Building building) {
//        List<Floor> newFloors = createFloors(fileInfo);
//        List<Floor> oldFloors = building.getFloors();
//
//        oldFloors.forEach(oldFloor -> {
//            if (oldFloor.getSbmFloors() != null) {
//                newFloors.stream()
//                        .filter(newFloor -> oldFloor.getSbmFloors()
//                                .stream()
//                                .anyMatch(oldSbmFloor -> newFloor.getSbmFloors()
//                                        .stream()
//                                        .anyMatch(newSbmFloor -> oldSbmFloor.getSbmFloorId().equals(newSbmFloor.getSbmFloorId()))))
//                        .findFirst()
//                        .ifPresent(oldFloor::update);
//                oldFloor.getSbmFloors().forEach(oldSbmFloor ->
//                        newFloors.stream()
//                                .flatMap(newFloor -> newFloor.getSbmFloors().stream())
//                                .filter(newSbmFloor -> oldSbmFloor.getSbmFloorId().equals(newSbmFloor.getSbmFloorId()))
//                                .findFirst()
//                                .ifPresent(oldSbmFloor::update));
//            }
//        });
//    }

//    private void forceUpdateFloor(UpdateBuildingDTO dto, FileInfo fileInfo, Building building) {
//        building.changeFileInfo(fileInfo);
//        List<Floor> newFloors = createFloors(fileInfo);
//        building.removeFloors();
//        for (Floor newFloor : newFloors) {
//            building.addFloor(newFloor);
//        }
//        building.update(dto);
//    }

    private void validateDuplicationCode(CreateBuildingDTO dto) {
        if (buildingRepository.existsByCode(dto.code())) {
            throw new CustomException(DUPLICATED_BUILDING_CODE);
        }
    }

    private void validateDuplicationCode(@NotNull Long id, String code) {
        Building building = buildingRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_BUILDING);
        });
        if (!building.getCode().equals(code) && buildingRepository.existsByCode(code)) {
            throw new CustomException(DUPLICATED_BUILDING_CODE);
        }
    }

    private FileInfoDTO saveZipFileAndGetFileInfo(MultipartFile file) throws IOException {
        return fileIoService.saveFile(file, FileEntityType.BUILDING, saveZipFile);
    }

    private List<Floor> createFloors(FileInfo fileInfo, String version) {
        Path xmlFilePath = findXmlFileName(Path.of(uploadRootPath, fileInfo.getFileEntityType(),fileInfo.getDirectoryName(), version));
        return parseFloors(xmlFilePath);
    }

    public Path findXmlFileName(Path filePath) {
        try (Stream<Path> paths = Files.walk(filePath)) {
            Optional<Path> xmlFilePath = paths.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().toLowerCase().endsWith(".xml"))
                    .findFirst();
            return xmlFilePath.orElseThrow(() -> new CustomException(NOT_FOUND_XML_FILE));
        } catch (IOException e) {
            throw new CustomException(NOT_FOUND_XML_FILE);
        }
    }

    public List<Floor> parseFloors(Path xmlFilePath) {
        Document doc = getDocument(xmlFilePath.toString());
        NodeList floorNodeList = doc.getElementsByTagName("Floor");

        return IntStream.range(0, floorNodeList.getLength())
                .mapToObj(floorNodeList::item)
                .filter(floorNode -> floorNode.getNodeType() == Node.ELEMENT_NODE &&
                        floorNode.getParentNode().getNodeName().equals("Floors"))
                .map(Element.class::cast)
                .map(this::buildSbmFloor)
                .collect(groupingBySbmFloorGroup())
                .values()
                .stream()
                .map(association())
                .toList();
    }


    private Function<Floor, Floor> association() {
        return floor -> {
            String sbmFloorNames = floor.getSbmFloors().stream()
                    .filter(sbmFloor -> sbmFloor.getIsMain().equals("True"))
                    .map(SbmFloor::getSbmFloorName)
                    .findFirst()
                    .orElseThrow(() -> new CustomException(NOT_FOUND_XML_FILE_IS_MAIN));

            floor.changeName(sbmFloorNames);
            floor.changeFloorNo(Integer.parseInt(floor.getSbmFloors().get(0).getSbmFloorBase()));
            ArrayList<SbmFloor> sbmFloorsCopy = new ArrayList<>(floor.getSbmFloors());
            sbmFloorsCopy.forEach(sbmFloor -> sbmFloor.changeFloor(floor));
            return floor;
        };
    }

    private Collector<SbmFloor, ?, Map<String, Floor>> groupingBySbmFloorGroup() {
        return Collectors.groupingBy(
                SbmFloor::getSbmFloorGroup,
                LinkedHashMap::new,
                floorList()
        );
    }

    private Collector<SbmFloor, Object, Floor> floorList() {
        return Collectors.collectingAndThen(
                toList(),
                sbmFloors -> Floor.builder()
                        .sbmFloors(new ArrayList<>(sbmFloors))
                        .build()
        );
    }


    private Document getDocument(String xmlFilePath) {
        try {
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(xmlFilePath);
            doc.getDocumentElement().normalize();
            return doc;
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new CustomException(FAILED_TO_PARSE_XML);
        }
    }

    private SbmFloor buildSbmFloor(Element floorElement) {
        String id = floorElement.getAttribute("id");
        String name = floorElement.getAttribute("name");
        String baseFloor = floorElement.getAttribute("baseFloor");
        String groupID = floorElement.getAttribute("groupID");
        String isMain = floorElement.getAttribute("isMain");
        String fileFileName = floorElement.getElementsByTagName("FileSource")
                .item(0)
                .getAttributes()
                .getNamedItem("name")
                .getNodeValue()
                .substring(2);

        return SbmFloor.builder()
                .sbmFloorId(id)
                .sbmFloorName(name)
                .sbmFloorBase(baseFloor)
                .sbmFloorGroup(groupID)
                .isMain(isMain)
                .sbmFileName(fileFileName)
                .build();
    }


    public List<FloorResponseDTO> findFloorById(Long id) {
        Building building = buildingRepository.findBuildingById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        List<Floor> floors = building.getFloors();
        return floors.stream()
                .map(floor -> FloorResponseDTO.builder()
                        .id(floor.getId())
                        .name(floor.getName())
                        .sbmFloor(floor.getSbmFloors().stream()
                                .map(sbmFloor -> SbmFloorDTO.builder()
                                        .id(sbmFloor.getId())
                                        .sbmFloorId(sbmFloor.getSbmFloorId())
                                        .sbmFloorName(sbmFloor.getSbmFloorName())
                                        .sbmFloorBase(sbmFloor.getSbmFloorBase())
                                        .sbmFloorGroup(sbmFloor.getSbmFloorGroup())
                                        .isMain(sbmFloor.getIsMain())
                                        .sbmFileName(sbmFloor.getSbmFileName())
                                        .build())
                                .toList()
                        )
                        .build())
                .toList();
    }

    public FloorResponseDTO findFloorByFloorId(Long id, Long floorId) {
        Building building = buildingRepository.findBuildingById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        Floor floor = building.getFloors().stream()
                .filter(f -> f.getId().equals(floorId))
                .findFirst()
                .orElseThrow(() -> new CustomException(NOT_FOUND_FLOOR));

        return FloorResponseDTO.builder()
                .id(floor.getId())
                .name(floor.getName())
                .sbmFloor(floor.getSbmFloors().stream()
                        .map(sbmFloor -> SbmFloorDTO.builder()
                                .id(sbmFloor.getId())
                                .sbmFloorId(sbmFloor.getSbmFloorId())
                                .sbmFloorName(sbmFloor.getSbmFloorName())
                                .sbmFloorBase(sbmFloor.getSbmFloorBase())
                                .sbmFloorGroup(sbmFloor.getSbmFloorGroup())
                                .isMain(sbmFloor.getIsMain())
                                .sbmFileName(sbmFloor.getSbmFileName())
                                .build()
                        )
                        .toList())
                .build();
    }

    @Transactional
    public void updateCamera2d(Long id, String camera2d) {
        buildingRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING))
                .changeCamera2d(camera2d);
    }

    @Transactional
    public void updateCamera3d(Long id, String camera3d) {
        buildingRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING))
                .changeCamera3d(camera3d);
    }

    @Transactional
    public Long saveBuildingHistory(CreateBuildingHistoryDTO dto, HttpServletRequest request) {
        Building building = buildingRepository.findById(dto.buildingId())
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        String username = getUsernameFromCookies(request);
        FileInfo fileInfo = getFileInfo(dto.fileInfoId());

        // 1. BuildingFileHistory 생성 및 저장
        BuildingFileHistory history = BuildingFileHistory.builder()
                .building(building)
                .fileInfo(fileInfo)
                .historyContent(dto.historyContent())
                .regUser(username)
                .buildingVersion(dto.version())
                .build();

        history = buildingFileHistoryRepository.save(history);


        List<Floor> floors = createFloors(fileInfo, dto.version());

        // 기존 층의 최대 floorNo 찾기
        int maxFloorNo = building.getFloors().stream()
        .mapToInt(Floor::getFloorNo)
        .max()
        .orElse(0);


        for (Floor floor : floors) {

            boolean found = building.getFloors().stream()
            .filter(f -> f.getName().equals(floor.getName()))
            .findFirst()
            .map(f -> {
                floor.changeFloorNo(f.getFloorNo());
                return true;
            })
            .orElse(false);

            if (!found) {
                maxFloorNo++;
                floor.changeFloorNo(maxFloorNo);
            }

            FloorHistory floorHistory = FloorHistory.builder()
                    .floor(floor)
                    .buildingFileHistory(history)
                    .build();

            floor.changeBuilding(building);

            floorHistoryRepository.save(floorHistory);
            floorRepository.save(floor);
        }

        return history.getId();
    }

    private String getUsernameFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> "USER_ID".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<HistoryResponseDTO> findHistoryByBuildingId(Long id){

        return buildingFileHistoryRepository.findByBuildingId(id).stream()
                .map(BuildingFileHistory::toHistoryResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HistoryResponseDTO> findHistoryById(Long id){

        return buildingFileHistoryRepository.findById(id).stream()
                .map(BuildingFileHistory::toHistoryResponseDTO)
                .collect(Collectors.toList());
    }

    // BuildingService.java
    @Transactional(readOnly = true)
    public List<FloorDetailResponseDTO> findFloorsByHistoryVersion(String version) {
        BuildingFileHistory history = buildingFileHistoryRepository.findByBuildingVersion(version)
                .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));

        return floorHistoryRepository.findByBuildingFileHistoryId(history.getId()).stream()
                .map(FloorHistory::getFloor)
                .map(floor -> FloorDetailResponseDTO.builder()
                        .id(floor.getId())
                        .name(floor.getName())
                        .no(floor.getFloorNo())
                        .sbmFloor(floor.getSbmFloors().stream()
                                .map(sbmFloor -> SbmFloorDTO.builder()
                                        .id(sbmFloor.getId())
                                        .sbmFloorId(sbmFloor.getSbmFloorId())
                                        .sbmFloorName(sbmFloor.getSbmFloorName())
                                        .sbmFloorBase(sbmFloor.getSbmFloorBase())
                                        .sbmFloorGroup(sbmFloor.getSbmFloorGroup())
                                        .isMain(sbmFloor.getIsMain())
                                        .sbmFileName(sbmFloor.getSbmFileName())
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteHistory(Long historyId) {
        // BuildingFileHistory 먼저 찾기
        BuildingFileHistory history = buildingFileHistoryRepository.findById(historyId)
                .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));

        // 해당 history가 활성화 되어 있다면 예외처리
        Building activeBuilding = buildingRepository.findByActiveVersion(history.getBuildingVersion());
        if (activeBuilding != null) {
            throw new IllegalStateException("활성화된 버전의 히스토리는 삭제할 수 없습니다.");
        }

        // FloorHistory 삭제(cascade로 Floor도 삭제됨)
        floorHistoryRepository.findByBuildingFileHistoryId(historyId)
                .forEach(floorHistoryRepository::delete);

        buildingFileHistoryRepository.delete(history);
    }
}
