package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.dto.*;
import com.pluxity.ktds.domains.building.entity.*;
import com.pluxity.ktds.domains.building.repostiory.BuildingFileHistoryRepository;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
public class BuildingService {
    private final BuildingRepository buildingRepository;
    private final FileInfoService fileIoService;
    private final SaveZipFile saveZipFile;
    private final FileInfoRepository fileInfoRepository;
    private final PoiRepository poiRepository;
    private final PatrolRepository patrolRepository;
    private final PatrolPointRepository patrolPointRepository;

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
        return buildingRepository.findAll().stream()
                .map(Building::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BuildingDetailResponseDTO> findDetailAll() {
        return buildingRepository.findAll().stream()
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

    @Transactional
    public FileInfoDTO saveFile(@NotNull final MultipartFile file) throws IOException {
        return saveZipFileAndGetFileInfo(file);
    }

    @Transactional
    public Long saveBuilding(@NotNull final CreateBuildingDTO dto) {
        validateDuplicationCode(dto);
        FileInfo fileInfo = getFileInfo(dto.fileInfoId());
        Building building = createBuildingByDto(dto, fileInfo);

        List<Floor> floors = createFloors(fileInfo);

        for (Floor floor : floors) {
            building.addFloor(floor);
        }

        createHistory(fileInfo, building);

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
        FileInfo fileInfo = null;
        validateDuplicationCode(id, dto.code());

        Building building = getBuildingById(id);

        if (dto.fileInfoId() != null) {
            fileInfo = getFileInfo(dto.fileInfoId());
//            validationFile(fileInfo, building);
        }

//        updateFields(dto, building, fileInfo);

        forceUpdateFloor(dto, fileInfo, building);
        return id;
    }


    @Transactional
    public Long updateForceBuilding(@NotNull final Long id, @NotNull final UpdateBuildingDTO dto) {
        validateDuplicationCode(id, dto.code());

        Building building = getBuildingById(id);
        FileInfo fileInfo = getFileInfo(dto.fileInfoId());
        updateFields(dto, building, fileInfo);
        return building.getId();
    }

    private void updateFields(UpdateBuildingDTO dto, Building building, FileInfo fileInfo) {
        if (fileInfo != null) {
            building.changeFileInfo(fileInfo);
            updateFloor(fileInfo, building);
//            createHistory(fileInfo, building);
        }
        building.update(dto);

    }

    @Transactional
    public void delete(@NotNull final Long id) {
        Building building = getBuildingById(id);

        List<BuildingFileHistory> buildingFileHistories = buildingFileHistoryRepository.findByBuildingId(building.getId());

        buildingFileHistoryRepository.deleteAll(buildingFileHistories);

        List<Patrol> patrols = patrolRepository.findByBuildingId(building.getId());

        if (!patrols.isEmpty()) {
            for (Patrol patrol : patrols) {
                List<PatrolPoint> patrolPoints = patrolPointRepository.findByPatrolId(patrol.getId());
                patrolPointRepository.deleteAll(patrolPoints);
            }
            patrolRepository.deleteByBuildingId(building.getId());
        }

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

    private void createHistory(FileInfo fileInfo, Building building) {
        BuildingFileHistory history = BuildingFileHistory.builder()
                .building(building)
                .fileInfo(fileInfo)
                .build();

        history = buildingFileHistoryRepository.save(history);
        history.updateBuildingVersion(toVersion(history.getCreatedAt()));
    }

    private void updateFloor(FileInfo fileInfo, Building building) {
        List<Floor> newFloors = createFloors(fileInfo);
        List<Floor> oldFloors = building.getFloors();

        oldFloors.forEach(oldFloor -> {
            if (oldFloor.getSbmFloors() != null) {
                newFloors.stream()
                        .filter(newFloor -> oldFloor.getSbmFloors()
                                .stream()
                                .anyMatch(oldSbmFloor -> newFloor.getSbmFloors()
                                        .stream()
                                        .anyMatch(newSbmFloor -> oldSbmFloor.getSbmFloorId().equals(newSbmFloor.getSbmFloorId()))))
                        .findFirst()
                        .ifPresent(oldFloor::update);
                oldFloor.getSbmFloors().forEach(oldSbmFloor ->
                        newFloors.stream()
                                .flatMap(newFloor -> newFloor.getSbmFloors().stream())
                                .filter(newSbmFloor -> oldSbmFloor.getSbmFloorId().equals(newSbmFloor.getSbmFloorId()))
                                .findFirst()
                                .ifPresent(oldSbmFloor::update));
            }
        });
    }

    private void forceUpdateFloor(UpdateBuildingDTO dto, FileInfo fileInfo, Building building) {
        building.changeFileInfo(fileInfo);
        List<Floor> newFloors = createFloors(fileInfo);
        building.removeFloors();
        for (Floor newFloor : newFloors) {
            building.addFloor(newFloor);
        }
        building.update(dto);
    }

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

    private List<Floor> createFloors(FileInfo fileInfo) {
        Path xmlFilePath = findXmlFileName(Path.of(uploadRootPath, fileInfo.getFileEntityType(), fileInfo.getDirectoryName()));
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

        String username = null;
        Cookie[] cookies = request.getCookies();
        if(cookies != null){
            for(Cookie cookie : cookies){
                if("USER_ID".equals(cookie.getName())){
                    username = cookie.getValue();
                    break;
                }
            }
        }

        FileInfo fileInfo = getFileInfo(dto.fileInfoId());

        BuildingFileHistory history = BuildingFileHistory.builder()
                .building(building)
                .fileInfo(fileInfo)
                .historyContent(dto.historyContent())
                .regUser(username)
                .build();

        history = buildingFileHistoryRepository.save(history);
        history.updateBuildingVersion(toVersion(history.getCreatedAt()));
        return history.getId();
    }

    private String toVersion(LocalDateTime dateTime){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        return dateTime.format(formatter);
    }

    @Transactional(readOnly = true)
    public List<HistoryResponseDTO> findHistoryByBuildingId(Long id){

        return buildingFileHistoryRepository.findByBuildingId(id).stream()
                .map(BuildingFileHistory::toHistoryResponseDTO)
                .collect(Collectors.toList());
    }
}
