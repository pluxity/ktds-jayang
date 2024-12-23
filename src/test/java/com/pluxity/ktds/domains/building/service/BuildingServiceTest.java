package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.CreateDomain;
import com.pluxity.ktds.domains.building.dto.*;
import com.pluxity.ktds.domains.building.entity.*;
import com.pluxity.ktds.domains.building.repostiory.BuildingFileHistoryRepository;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import com.pluxity.ktds.domains.poi_set.repository.PoiSetRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
//@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class BuildingServiceTest {

    @Autowired
    BuildingService buildingService;

    @Value("${root-path}")
    private String rootPath;
    @Autowired
    private BuildingRepository buildingRepository;
    @Autowired
    private FileInfoRepository fileInfoRepository;
    @Autowired
    private FloorRepository floorRepository;
    @Autowired
    EntityManager em;
    @Autowired
    private BuildingFileHistoryRepository buildingFileHistoryRepository;
    private Long fileInfoId;
    private Long poiSetId;
    @Autowired
    private PoiSetRepository poiSetRepository;

    //    @BeforeAll
    @BeforeEach
    public void init() {
        fileInfoId = null;
        try {
            Path zipFilePath = Paths.get("src", "test", "resources", "building.zip");
            byte[] fileContent = Files.readAllBytes(zipFilePath);
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    zipFilePath.getFileName().toString(),
                    "application/zip",
                    fileContent);

            fileInfoId = buildingService.saveFile(file).id();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        PoiSet poiSet = PoiSet.builder()
                .name(CreateDomain.generateUUID())
                .build();

        poiSetId = poiSetRepository.save(poiSet).getId();
    }

    @Test
    void findById() {
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        BuildingDetailResponseDto responseDto = buildingService.findById(buildingId);

        //then
        assertThat(responseDto.id()).isEqualTo(buildingId);
        assertThat(responseDto.name()).isEqualTo(buildingRequestDto.name());
        assertThat(responseDto.description()).isEqualTo(buildingRequestDto.description());
        assertThat(responseDto.buildingFile().id()).isEqualTo(buildingRequestDto.fileInfoId());
        assertThat(responseDto.floorIds()).isNotEmpty();
    }

    @Test
    void findAll() {
        //given
        List<Long> buildingIds = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            String code = CreateDomain.generateUUID();
            //given
            BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                    .code(code)
                    .name(CreateDomain.generateUUID())
                    .description(CreateDomain.generateUUID())
                    .fileInfoId(fileInfoId)
                    .poiSetId(poiSetId)
                    .build();
            buildingIds.add(buildingService.saveBuilding(buildingRequestDto));
        }

        //when
        List<BuildingResponseDto> responseDtos = buildingService.findAll();

        //then
        for (Long fileInfoId : buildingIds) {
            assertThat(responseDtos.stream().map(BuildingResponseDto::id).collect(Collectors.toList())).contains(fileInfoId);
        }

    }

    @Test
    void saveBuilding() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();

        //when
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        Building fetchBuilding = buildingRepository.findById(buildingId).orElseThrow();

        //then
        assertBuildingFields(fetchBuilding, buildingRequestDto);
        assertBuildingFileInfo(fetchBuilding);
        assertBuildingFloors(fetchBuilding);
        assertBuildingFileInfoHistory(fetchBuilding, fetchBuilding.getFileInfo());
    }

    @Test
    void saveDuplicateCode() {
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code("duplicateCode")
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        buildingService.saveBuilding(buildingRequestDto);

        //when then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.saveBuilding(buildingRequestDto));
        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_BUILDING_CODE);

    }

    @Test
    void updateDuplicateCode() {
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code("duplicateCode")
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //given
        BuildingRequestDto duplicateCode2 = BuildingRequestDto.builder()
                .code("duplicateCode2")
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId2 = buildingService.saveBuilding(duplicateCode2);

        BuildingRequestDto duplicateCode = BuildingRequestDto.builder()
                .code("duplicateCode2")
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .build();
        //when
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateBuilding(buildingId, duplicateCode));

        //then
        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_BUILDING_CODE);
    }

    @Test
    void saveWithoutFile() {
        //given
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .code(CreateDomain.generateUUID())
                .poiSetId(poiSetId)
                .build();
        assertThrows(InvalidDataAccessApiUsageException.class, () ->
                buildingService.saveBuilding(dto)
        );
    }

    @Test
    void updateWithoutFile() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .code(buildingRequestDto.code())
                .poiSetId(poiSetId)
                .build();

        assertThrows(InvalidDataAccessApiUsageException.class, () ->
                buildingService.updateBuilding(buildingId, dto));

    }


    @Test
    void updateBuilding() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);
        Building savedBuilding = buildingRepository.findById(buildingId).orElseThrow();

        //when
        //given
        BuildingRequestDto buildingUpdateRequestDto = BuildingRequestDto.builder()
                .code(buildingRequestDto.code())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long updatedBuildingId = buildingService.updateBuilding(buildingId, buildingUpdateRequestDto);
        Building building = buildingRepository.findById(updatedBuildingId).orElseThrow();

        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(buildingUpdateRequestDto.code())
                .name(buildingUpdateRequestDto.name())
                .description(buildingUpdateRequestDto.description())
                .build();
        //then
        assertBuildingFields(building, dto);
        assertBuildingFileInfo(building);
        assertBuildingFloors(building);
        assertBuildingFileInfoHistory(building, building.getFileInfo());
    }
    //도면이 바뀔때만 history update 추가
    //나머지 바뀌는거는 history update 추가하지 아니함


    @Test
    void updateThrowInvalidXmlTitle() {
        //given
        String code1 = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);
        Building savedBuilding = buildingRepository.findById(buildingId).orElseThrow();

        //when
        //given
        Long invalidFileId = createFileInfo("building_INVALID_XML_TITLE.zip");
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(invalidFileId)
                .poiSetId(poiSetId)
                .build();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateBuilding(buildingId, dto));
        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_XML_TITLE);
    }

    @Test
    void updateThrowNotFoundbuliding() {
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(-1L)
                .build();

        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateBuilding(-1L, dto));
        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
    }


    @Test
    void updateForceThrowNotFoundBuilding() {
        Long fileInfoId = createFileInfo("building.zip");
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .build();

        assertThrows(CustomException.class, () -> buildingService.updateForceBuilding(-1L, dto));
    }

    @Test
    void updateForceThrowNotFoundFileInfo() {
        Long fileInfoId = createFileInfo("building.zip");
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();

        Long buildingId = buildingService.saveBuilding(dto);

        BuildingRequestDto updateDto = BuildingRequestDto.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(-1L)
                .poiSetId(poiSetId)
                .build();

        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateForceBuilding(buildingId, updateDto));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_plx_file);
    }

    @Test
    void updateLod() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        LodSettings lodSettings = LodSettings.builder()
                .lodData(CreateDomain.generateUUID())
                .lodCount(5L)
                .lodMaxDistance(123.4567)
                .build();

        buildingService.updateLod(buildingId, lodSettings);
        BuildingDetailResponseDto buildingDetailResponseDto = buildingService.findById(buildingId);
        //then
        assertThat(buildingDetailResponseDto.lodSettings()).isNotNull();
        assertThat(buildingDetailResponseDto.lodSettings().getLodData()).isEqualTo(lodSettings.getLodData());
        assertThat(buildingDetailResponseDto.lodSettings().getLodCount()).isEqualTo(lodSettings.getLodCount());
        assertThat(buildingDetailResponseDto.lodSettings().getLodMaxDistance()).isEqualTo(lodSettings.getLodMaxDistance());
    }

    @Test
    void updateLodThrowNotFoundBuilding() {
        //given
        LodSettings lodSettings = LodSettings.builder()
                .lodData(CreateDomain.generateUUID())
                .lodCount(5L)
                .lodMaxDistance(123.4567)
                .build();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateLod(-1L, lodSettings));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
    }

    @Test
    void updateTopology() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        String topology = UUID.randomUUID().toString();
        buildingService.updateTopology(buildingId, topology);
        BuildingDetailResponseDto responseDto = buildingService.findById(buildingId);
        //then
        assertThat(responseDto.topology()).isEqualTo(topology);
    }

    @Test
    void updateTopologyThrowNotFoundBuilding() {
        //given
        String topology = UUID.randomUUID().toString();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateTopology(-1L, topology));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
    }


    private Long createFileInfo(String fileName) {
        Long fileInfoId;
        try {
            Path zipFilePath = Paths.get("src", "test", "resources", fileName);
            byte[] fileContent = Files.readAllBytes(zipFilePath);
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    zipFilePath.getFileName().toString(),
                    "application/zip",
                    fileContent);

            fileInfoId = buildingService.saveFile(file).id();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return fileInfoId;
    }


    @Test
    void deleteBuilding() {
        //given
        String code1 = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto2 = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId2 = buildingService.saveBuilding(buildingRequestDto2);

        //when
        buildingService.delete(buildingId);

        //then
        assertThat(buildingRepository.findById(buildingId)).isEmpty();
        assertThat(floorRepository.findAll().stream().map(f -> f.getBuilding().getId()).collect(Collectors.toList())).doesNotContain(buildingId);
    }

    @Test
    void deleteThrowNotFoundException() {
        //given
        Long buildingId = -1L;

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.delete(buildingId));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
    }

    @Test
    void updateThrowNotFoundXmlFile() {
        //given
        String code1 = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        String code = CreateDomain.generateUUID();
        //given
        Long invalidFileInfo = createFileInfo("building_no_xml.zip");
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(invalidFileInfo)
                .poiSetId(poiSetId)
                .build();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateBuilding(buildingId, dto));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_XML_FILE);
    }

    @Test
    void updateThrowNotMatchSbmFile() {
        //given
        String code1 = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        //given
        Long invalidFileId = createFileInfo("building_no_match_sbm.zip");
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(code1)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(invalidFileId)
                .poiSetId(poiSetId)
                .build();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.updateBuilding(buildingId, dto));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_MATCH_SBM_FILE);
    }


    @Test
    void updateForceBuilding() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);
        Building savedBuilding = buildingRepository.findById(buildingId).orElseThrow();

        //when
        //given
        BuildingRequestDto dto = BuildingRequestDto.builder()
                .code(buildingRequestDto.code())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long updatedBuildingId = buildingService.updateForceBuilding(buildingId, dto);
        Building building = buildingRepository.findById(updatedBuildingId).orElseThrow();

        BuildingRequestDto saveRequestDto = BuildingRequestDto.builder()
                .code(dto.code())
                .name(dto.name())
                .description(dto.description())
                .build();


        //then
        assertBuildingFields(building, saveRequestDto);
        assertBuildingFileInfo(building);
        assertBuildingFloors(building);
        assertBuildingFileInfoHistory(building, building.getFileInfo());
    }

    @Test
    void throwFailedToParseXml() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        Long invalidFileId = createFileInfo("building_invalid_xml.zip");
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(invalidFileId)
                .poiSetId(poiSetId)
                .build();

        //then
        CustomException customException = assertThrows(CustomException.class, () -> buildingService.saveBuilding(buildingRequestDto));

        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.FAILED_TO_PARSE_XML);
    }


    @Test
    void findFloorById() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        List<FloorResponseDto> floorResponseDtos = buildingService.findFloorById(buildingId);
        Building building = buildingRepository.findById(buildingId).orElseThrow();

        //then
        assertThat(floorResponseDtos.size()).isEqualTo(building.getFloors().size());
        assertThat(floorResponseDtos.stream().map(FloorResponseDto::id).collect(Collectors.toList()))
                .containsAll(building.getFloors().stream().map(Floor::getId).collect(Collectors.toList()));
    }

    @Test
    void findFloor() {
        //given
        String code = CreateDomain.generateUUID();
        //given
        BuildingRequestDto buildingRequestDto = BuildingRequestDto.builder()
                .code(code)
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();
        Long buildingId = buildingService.saveBuilding(buildingRequestDto);

        //when
        Building building = buildingRepository.findById(buildingId).orElseThrow();
        Floor floorInBuilding = building.getFloors().get(0);
        FloorResponseDto dto = buildingService.findFloorByFloorId(buildingId, floorInBuilding.getId());

        //then
        assertThat(dto.id()).isEqualTo(floorInBuilding.getId());
        assertThat(dto.name()).isEqualTo(floorInBuilding.getName());
        assertThat(dto.sbmFloor()).isEqualTo(floorInBuilding.getSbmFloors().stream().map(sbmFloor -> SbmFloorDto.builder()
                        .id(sbmFloor.getId())
                        .sbmFloorId(sbmFloor.getSbmFloorId())
                        .sbmFloorName(sbmFloor.getSbmFloorName())
                        .sbmFloorBase(sbmFloor.getSbmFloorBase())
                        .sbmFloorGroup(sbmFloor.getSbmFloorGroup())
                        .isMain(sbmFloor.getIsMain())
                        .sbmFileName(sbmFloor.getSbmFileName())
                        .build())
                .toList());
    }

    private void assertBuildingFields(Building buildingByDb, BuildingRequestDto buildingRequestDto) {
        assertThat(buildingByDb.getCode()).isEqualTo(buildingRequestDto.code());
        assertThat(buildingByDb.getName()).isEqualTo(buildingRequestDto.name());
        assertThat(buildingByDb.getDescription()).isEqualTo(buildingRequestDto.description());
    }

    private void assertBuildingFileInfo(Building building) {
        FileInfo fileInfo = fileInfoRepository.findById(building.getFileInfo().getId()).orElseThrow();

        assertThat(building.getFileInfo()).isNotNull();
        assertThat(building.getFileInfo().getDirectoryName()).isEqualTo(fileInfo.getDirectoryName());
        assertThat(building.getFileInfo().getExtension()).isEqualTo(fileInfo.getExtension());
        assertThat(building.getFileInfo().getOriginName()).isEqualTo(fileInfo.getOriginName());
        assertThat(building.getFileInfo().getStoredName()).isEqualTo(fileInfo.getStoredName());
    }

    private void assertBuildingFloors(Building buildingByDb) {
        List<Floor> floors = buildingByDb.getFloors();
        List<List<SbmFloor>> sbmList = floors.stream()
                .map(Floor::getSbmFloors)
                .toList();
        List<SbmFloor> sbmFloors = sbmList.stream()
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();
        for (SbmFloor sbmFloor : sbmFloors) {
            assertThat(sbmFloor.getSbmFloorId()).isNotBlank();
            assertThat(sbmFloor.getSbmFileName()).isNotBlank();
            assertThat(sbmFloor.getSbmFloorBase()).isNotBlank();
            assertThat(sbmFloor.getSbmFloorGroup()).isNotBlank();
            assertThat(sbmFloor.getSbmFloorName()).isNotBlank();
            assertThat(sbmFloor.getIsMain()).isNotBlank();
        }


    }

    private void assertBuildingFileInfoHistory(Building building, FileInfo fileInfo) {
        buildingFileHistoryRepository.findByBuildingId(building.getId())
                .stream()
                .map(BuildingFileHistory::getBuilding)
                .forEach(b -> {
                    assertThat(b.getId()).isEqualTo(building.getId());
                    assertThat(b.getCode()).isEqualTo(building.getCode());
                    assertThat(b.getName()).isEqualTo(building.getName());
                    assertThat(b.getDescription()).isEqualTo(building.getDescription());
                });

        buildingFileHistoryRepository.findByFileInfoId(fileInfo.getId())
                .stream()
                .map(BuildingFileHistory::getFileInfo)
                .forEach(p -> {
                    assertThat(p.getId()).isEqualTo(fileInfo.getId());
                    assertThat(p.getDirectoryName()).isEqualTo(fileInfo.getDirectoryName());
                    assertThat(p.getExtension()).isEqualTo(fileInfo.getExtension());
                    assertThat(p.getOriginName()).isEqualTo(fileInfo.getOriginName());
                    assertThat(p.getStoredName()).isEqualTo(fileInfo.getStoredName());
                });
    }

    public Long saveFile(String fileName) {
        fileInfoId = null;
        try {
            Path zipFilePath = Paths.get("src", "test", "resources", fileName);
            byte[] fileContent = Files.readAllBytes(zipFilePath);
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    zipFilePath.getFileName().toString(),
                    "application/zip",
                    fileContent);

            return fileInfoId = buildingService.saveFile(file).id();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
