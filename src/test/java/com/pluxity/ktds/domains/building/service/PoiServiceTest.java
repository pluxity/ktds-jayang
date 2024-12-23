package com.pluxity.ktds.domains.building.service;//package com.pluxity.ktds.domains.building.service;
//
//import com.pluxity.ktds.CreateDomain;
//import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDto;
//import com.pluxity.ktds.domains.building.dto.PoiRequestDto;
//import com.pluxity.ktds.domains.building.dto.PoiResponseDto;
//import com.pluxity.ktds.domains.building.entity.Building;
//import com.pluxity.ktds.domains.building.entity.Floor;
//import com.pluxity.ktds.domains.building.entity.Poi;
//import com.pluxity.ktds.domains.building.entity.Spatial;
//import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
//import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
//import com.pluxity.ktds.domains.poi_set.entity.IconSet;
//import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
//import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
//import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
//import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
//import com.pluxity.ktds.domains.poi_set.repository.PoiSetRepository;
//import com.pluxity.ktds.domains.poi_set.service.IconSetService;
//import com.pluxity.ktds.domains.poi_set.service.PoiCategoryService;
//import com.pluxity.ktds.domains.poi_set.service.PoiSetService;
//import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
//import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
//import com.pluxity.ktds.global.constant.ErrorCode;
//import com.pluxity.ktds.global.exception.CustomException;
//import jakarta.persistence.EntityManager;
//import jakarta.persistence.PersistenceContext;
//import jakarta.validation.ConstraintViolationException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//
//@SpringBootTest
//@Transactional
//class PoiServiceTest {
//
//    @Autowired
//    BuildingService buildingService;
//
//    @Autowired
//    SaveImage imageStrategy;
//    @Autowired
//    SaveZipFile zipStrategy;
//    @Autowired
//    IconSetService iconSetService;
//    @PersistenceContext
//    EntityManager em;
//    @Autowired
//    PoiCategoryService poiCategoryService;
//    @Autowired
//    PoiCategoryRepository poiCategoryRepository;
//    @Autowired
//    IconSetRepository iconSetRepository;
//    @Autowired
//    BuildingRepository buildingRepository;
//    @Autowired
//    PoiService poiService;
//    @Autowired
//    PoiRepository poiRepository;
//    @Autowired
//    PoiSetService poiSetService;
//    @Autowired
//    PoiSetRepository poiSetRepository;
//
//
//    @BeforeEach
//    public void init() {
//        Building building = Building.builder()
//                .name("test")
//                .code("test")
//                .description("test")
//                .build();
//
//        Building fetchBuilding = buildingRepository.save(building);
//        Floor floor = Floor.builder()
//                .name("test")
//                .build();
//        fetchBuilding.addFloor(floor);
//
//        IconSet iconSet1 = IconSet.builder()
//                .name("test")
//                .build();
//        IconSet iconSet2 = IconSet.builder()
//                .name("test2")
//                .build();
//
//        PoiCategory poiCategory = PoiCategory.builder()
//                .name("test")
//                .build();
//
//        PoiSet poiSet = PoiSet.builder()
//                .name("test")
//                .build();
//
//        iconSetRepository.save(iconSet1);
//        iconSetRepository.save(iconSet2);
//        poiCategoryRepository.save(poiCategory);
//
//
//        building.changePoiSet(poiSet);
//        poiSet.updatePoiCategories(List.of(poiCategory));
//        poiCategory.updateIconSets(List.of(iconSet1, iconSet2));
//
//    }
//
//    @Test
//    void findById() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        String code = CreateDomain.generateUUID();
//        String name = CreateDomain.generateUUID();
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(name)
//                .code(code)
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        //when
//        PoiDetailResponseDto responseDto = poiService.findById(poiId);
//
//        //then
//        assertThat(responseDto).isNotNull();
//        assertThat(responseDto.buildingId()).isEqualTo(buildingId);
//        assertThat(responseDto.floorId()).isEqualTo(floorId);
//        assertThat(responseDto.poiCategoryId()).isEqualTo(poiCategoryId);
//        assertThat(responseDto.iconSetId()).isEqualTo(iconSetId);
//        assertThat(responseDto.code()).isEqualTo(code);
//        assertThat(responseDto.name()).isEqualTo(name);
//
//    }
//
//    @Test
//    void findAll() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        String code = CreateDomain.generateUUID();
//        String name = CreateDomain.generateUUID();
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(name)
//                .code(code)
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        poiService.save(saveDto);
//
//        //when
//        List<PoiResponseDto> responseDtos = poiService.findAll();
//
//        //then
//        assertThat(responseDtos).isNotNull();
//        assertThat(responseDtos.get(0).code()).isEqualTo(code);
//        assertThat(responseDtos.get(0).name()).isEqualTo(name);
//    }
//
//    @Test
//    void save() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto dto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        //when
//        Long poiId = poiService.save(dto);
//        Poi poi = poiRepository.findById(poiId).orElseThrow();
//
//        //then
//        assertThat(poi).isNotNull();
//        assertThat(poi.getBuilding().getId()).isEqualTo(buildingId);
//        assertThat(poi.getFloor().getId()).isEqualTo(floorId);
//        assertThat(poi.getPoiCategory().getId()).isEqualTo(poiCategoryId);
//        assertThat(poi.getIconSet().getId()).isEqualTo(iconSetId);
//
//    }
//
//    //
//    @Test
//    void updatePoi() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        //when
//        Long updateFloorId = buildingRepository.findAll().get(0).getFloors().get(0).getId();
//        String updateName = CreateDomain.generateUUID();
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .code(saveDto.code())
//                .name(updateName)
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        poiService.updatePoi(poiId, updateDto);
//
//        Poi poi = poiRepository.findById(poiId).orElseThrow();
//        //then
//        assertThat(poi).isNotNull();
//        assertThat(poi.getBuilding().getId()).isEqualTo(buildingId);
//        assertThat(poi.getFloor().getId()).isEqualTo(updateFloorId);
//        assertThat(poi.getPoiCategory().getId()).isEqualTo(poiCategoryId);
//        assertThat(poi.getIconSet().getId()).isEqualTo(iconSetId);
//        assertThat(poi.getName()).isEqualTo(updateName);
//    }
//
//    @Test
//    void updateSpatial() {
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//
//        Long poiId = poiService.save(saveDto);
//
//        Spatial spatial = Spatial.builder()
//                .x(10.1)
//                .y(20.2)
//                .z(30.3)
//                .build();
//
//        //when
//        poiService.updatePosition(poiId, spatial);
//        poiService.updateRotation(poiId, spatial);
//        poiService.updateScale(poiId, spatial);
//
//        Poi poi = poiRepository.findById(poiId).orElseThrow();
//        //then
//        assertThat(poi.getPosition()).isEqualTo(spatial);
//        assertThat(poi.getRotation()).isEqualTo(spatial);
//        assertThat(poi.getScale()).isEqualTo(spatial);
//    }
//
//    @Test
//    void delete() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        //when
//        poiService.delete(poiId);
//
//        //then
//        boolean deleted = poiRepository.existsById(poiId);
//        assertThat(deleted).isFalse();
//    }
//
//    @Test
//    void duplicateSaveCode() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        poiService.save(saveDto);
//
//        //when
//        PoiRequestDto duplicateDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(saveDto.code())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        //then
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(duplicateDto));
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_POI_CODE);
//    }
//
//    @Test
//    void duplicatedUpdateCode() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        PoiRequestDto saveDto2 = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId2 = poiService.save(saveDto2);
//
//        //when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(saveDto.code())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        //then
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId2, updateDto));
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_POI_CODE);
//    }
//
//    @Test
//    void savePoiMissingFields() {
//        //given
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .build();
//        //when
//        ConstraintViolationException constraintViolationException = assertThrows(ConstraintViolationException.class, () -> poiService.save(saveDto));
//
//        //then
//        assertThat(constraintViolationException.getConstraintViolations()).hasSize(6);
//
//    }
//
//    @Test
//    void updateNonExistentPoi() {
//        // given
//        Long poiId = -1L;
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .build();
//
//        // when
//        assertThrows(ConstraintViolationException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
////        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_POI);
//    }
//
//    @Test
//    void deleteNonExistentPoi() {
//        // given
//        Long poiId = -1L;
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.delete(poiId));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_POI);
//    }
//
//    @Test
//    void updatePoiInvalidProperty() {
//        //given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        // when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(saveDto.name())
//                .code(saveDto.code())
//                .buildingId(-1L)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
//    }
//
//    @Test
//    void savePoiInvalidBuildingId() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(-1L)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetRepository.findAll().get(0).getId())
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(saveDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_BUILDING);
//    }
//
//    @Test
//    void savePoiInvalidFloorId() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(-1L)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(saveDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_FLOOR_WITH_BUILDING);
//    }
//
//    @Test
//    void savePoiInvalidPoiCategoryId() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(-1L)
//                .iconSetId(iconSetRepository.findAll().get(0).getId())
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(saveDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
//    }
//
//    @Test
//    void savePoiInvalidIconSetId() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(-1L)
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(saveDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
//    }
//
//    @Test
//    void updatePoiNonExistentFloor() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        // when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(saveDto.name())
//                .code(saveDto.code())
//                .buildingId(saveDto.buildingId())
//                .floorId(-1L)
//                .poiCategoryId(saveDto.poiCategoryId())
//                .iconSetId(saveDto.iconSetId())
//                .build();
//
//
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_FLOOR_WITH_BUILDING);
//    }
//
//    @Test
//    void updatePoiMissingFields() {
//        // given
//
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//
//        PoiRequestDto updateDto = PoiRequestDto.builder().build();
//        assertThrows(ConstraintViolationException.class,
//                () -> poiService.updatePoi(poiId, updateDto));
//
//    }
//
//    @Test
//    void updatePoiInvalidFloor() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        // when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(saveDto.name())
//                .code(saveDto.code())
//                .buildingId(saveDto.buildingId())
//                .floorId(-1L)
//                .poiCategoryId(saveDto.poiCategoryId())
//                .iconSetId(saveDto.iconSetId())
//                .build();
//
//
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_FLOOR_WITH_BUILDING);
//    }
//
//    @Test
//    void updatePoiInvalidCategory() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        // when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(saveDto.name())
//                .code(saveDto.code())
//                .buildingId(saveDto.buildingId())
//                .floorId(saveDto.floorId())
//                .poiCategoryId(-1L)
//                .iconSetId(saveDto.iconSetId())
//                .build();
//
//
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
//    }
//
//    @Test
//    void updatePoiInvalidIconSet() {
//        // given
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//
//        PoiRequestDto saveDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//        Long poiId = poiService.save(saveDto);
//
//        // when
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(saveDto.name())
//                .code(saveDto.code())
//                .buildingId(saveDto.buildingId())
//                .floorId(saveDto.floorId())
//                .poiCategoryId(saveDto.poiCategoryId())
//                .iconSetId(-1L)
//                .build();
//
//
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
//    }
//
//    @Test
//    void findByIdNonExistentPoi() {
//        // given
//        Long poiId = -1L;
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.findById(poiId));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_POI);
//    }
//
//    @Test
//    void savePoiDuplicateCode() {
//        // given
//        String code = CreateDomain.generateUUID();
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//        PoiRequestDto saveDto1 = PoiRequestDto.builder()
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .name(CreateDomain.generateUUID())
//                .code(code)
//                .build();
//        poiService.save(saveDto1);
//
//        PoiRequestDto saveDto2 = PoiRequestDto.builder()
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .name(CreateDomain.generateUUID())
//                .code(code)
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.save(saveDto2));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_POI_CODE);
//    }
//
//    @Test
//    void updatePoiNonExistentPoi() {
//        // given
//        Long poiId = -1L;
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(CreateDomain.generateUUID())
//                .buildingId(-1L)
//                .floorId(-1L)
//                .poiCategoryId(-1L)
//                .iconSetId(-1L)
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND_POI);
//    }
//
//    @Test
//    void updatePoiDuplicateCode() {
//        // given
//        String code1 = CreateDomain.generateUUID();
//        String code2 = CreateDomain.generateUUID();
//
//        Building building = buildingRepository.findAll().get(0);
//        Long buildingId = building.getId();
//        Long floorId = building.getFloors().get(0).getId();
//        Long poiCategoryId = building.getPoiSet().getPoiCategories().get(0).getId();
//        Long iconSetId = building.getPoiSet().getPoiCategories().get(0).getIconSets().get(0).getId();
//        PoiRequestDto saveDto1 = PoiRequestDto.builder()
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .name(CreateDomain.generateUUID())
//                .code(code1)
//                .build();
//        Long poiId1 = poiService.save(saveDto1);
//
//        PoiRequestDto saveDto2 = PoiRequestDto.builder()
//                .buildingId(building.getId())
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .name(CreateDomain.generateUUID())
//                .code(code2)
//                .build();
//        Long poiId2 = poiService.save(saveDto2);
//
//        PoiRequestDto updateDto = PoiRequestDto.builder()
//                .name(CreateDomain.generateUUID())
//                .code(code1)
//                .buildingId(buildingId)
//                .floorId(floorId)
//                .poiCategoryId(poiCategoryId)
//                .iconSetId(iconSetId)
//                .build();
//
//        // when
//        CustomException customException = assertThrows(CustomException.class, () -> poiService.updatePoi(poiId2, updateDto));
//
//        // then
//        assertThat(customException.getErrorCode()).isEqualTo(ErrorCode.DUPLICATED_POI_CODE);
//    }
//}
//
