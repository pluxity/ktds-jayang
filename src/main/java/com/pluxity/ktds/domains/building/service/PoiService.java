package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.dto.*;
import com.pluxity.ktds.domains.building.entity.*;
import com.pluxity.ktds.domains.building.repostiory.*;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvResponseDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import com.pluxity.ktds.domains.cctv.repository.PoiCctvRepository;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiMiddleCategoryRepository;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import com.pluxity.ktds.domains.sop.service.SopService;
import com.pluxity.ktds.global.annotation.IgnoreBuildingPermission;
import com.pluxity.ktds.global.annotation.IgnorePoiPermission;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.ExcelUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StopWatch;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ExcelHeaderNameCode.*;
import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
@Validated
@Slf4j
public class PoiService {

    private final PoiRepository poiRepository;
    private final BuildingRepository buildingRepository;
    private final PoiCategoryRepository poiCategoryRepository;
    private final IconSetRepository iconSetRepository;
    private final PoiMiddleCategoryRepository poiMiddleCategoryRepository;
    private final PoiCctvRepository poiCctvRepository;
    private final BuildingFileHistoryRepository buildingFileHistoryRepository;
    private final FloorHistoryRepository floorHistoryRepository;
    private final PoiTagRepository poiTagRepository;
    private final SopService sopService;


    private Poi getPoi(Long id) {
        return poiRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI));
    }

    @Transactional(readOnly = true)
    public List<PoiDetailResponseDTO> findByCategoryId(@NotNull final Long id) {
        return poiRepository.findPoisByPoiCategoryId(id).stream()
                .map(Poi::toDetailResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PoiDetailResponseDTO> findPoisByBuildingId(@NotNull final Long id) {
        return buildingRepository.findPoisByBuildingId(id).stream()
                .map(Poi::toDetailResponseDTO)
                .toList();
    }

    // floorId로 조회
    @Transactional(readOnly = true)
    public List<PoiDetailResponseDTO> findPoisByFloorNo(@NotNull final Integer floorNo) {
        return poiRepository.findPoisByFloorNo(floorNo).stream()
                .map(Poi::toDetailResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PoiDetailResponseDTO findById(@NotNull final Long id) {
        Poi poi = getPoi(id);
        return poi.toDetailResponseDTO();
    }

    @Transactional(readOnly = true)
    public List<PoiResponseDTO> findAll() {
        return poiRepository.findAll().stream()
                .map(Poi::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PoiDetailResponseDTO> findAllDetail() {
        log.info("findAllDetail() start");

        StopWatch sw = new StopWatch("findAllDetail");

        sw.start("poiRepository.findAll");
        List<Poi> poiList = poiRepository.findAll();
        sw.stop();

        sw.start("poiCctvRepository.findAllByPoiIn");
        List<PoiCctv> allCctvs = poiCctvRepository.findAllByPoiIn(poiList);

        Map<Long, List<PoiCctv>> cctvMap = allCctvs.stream()
                .collect(Collectors.groupingBy(poiCctv -> poiCctv.getPoi().getId()));
        sw.stop();

        sw.start("DTO mapping");
        List<PoiDetailResponseDTO> result = poiList.stream()
                .map(poi -> {
                    List<PoiCctvDTO> cctvDtoList = cctvMap.getOrDefault(poi.getId(), List.of()).stream()
                            .map(PoiCctvDTO::from)
                            .toList();

                    PoiDetailResponseDTO base = poi.toDetailResponseDTO();
                    return PoiDetailResponseDTO.builder()
                            .id(base.id())
                            .buildingId(base.buildingId())
                            .floorNo(base.floorNo())
                            .poiCategoryId(base.poiCategoryId())
                            .poiMiddleCategoryId(base.poiMiddleCategoryId())
                            .iconSetId(base.iconSetId())
                            .position(base.position())
                            .rotation(base.rotation())
                            .scale(base.scale())
                            .name(base.name())
                            .code(base.code())
                            .tagNames(base.tagNames())
                            .cctvList(cctvDtoList)
                            .isLight(base.isLight())
                            .lightGroup(base.lightGroup())
                            .cameraIp(base.cameraIp())
                            .cameraId(base.cameraId())
                            .build();
                })
                .toList();
        sw.stop();

        log.info(sw.prettyPrint());

        return result;
    }

    @Transactional(readOnly = true)
    public List<PoiDetailResponseDTO> findFilteredAllDetail() {
        log.info("findFilteredAllDetail() start");
        StopWatch sw = new StopWatch();

        sw.start("findAll");
        List<Poi> poiList = poiRepository.findAllWithPositionPresent();
        sw.stop();

        sw.start("batchCctvFetch");
//        Map<Long, List<PoiCctv>> cctvMap = poiList.stream()
//                .collect(Collectors.toMap(
//                        Poi::getId,
//                        poi -> poiCctvRepository.findAllByPoi(poi)
//                ));
        List<PoiCctv> allCctvs = poiCctvRepository.findAllByPoiIn(poiList);
        Map<Long, List<PoiCctv>> cctvMap = allCctvs.stream()
                        .collect(Collectors.groupingBy(cctv -> cctv.getPoi().getId()));
        sw.stop();

        sw.start("dto start");

        List<PoiDetailResponseDTO> result = new ArrayList<>(poiList.size());
        for (Poi poi : poiList) {
            List<PoiCctvDTO> cctvDtoList = cctvMap
                    .getOrDefault(poi.getId(), Collections.emptyList())
                    .stream()
                    .map(PoiCctvDTO::from)
                    .toList();

            PoiDetailResponseDTO base = poi.toDetailResponseDTO();
            result.add(
                    PoiDetailResponseDTO.builder()
                            .id(base.id())
                            .buildingId(base.buildingId())
                            .floorNo(base.floorNo())
                            .poiCategoryId(base.poiCategoryId())
                            .poiMiddleCategoryId(base.poiMiddleCategoryId())
                            .iconSetId(base.iconSetId())
                            .position(base.position())
                            .rotation(base.rotation())
                            .scale(base.scale())
                            .name(base.name())
                            .code(base.code())
                            .tagNames(base.tagNames())
                            .cctvList(cctvDtoList)
                            .isLight(base.isLight())
                            .lightGroup(base.lightGroup())
                            .cameraIp(base.cameraIp())
                            .cameraId(base.cameraId())
                            .build()
            );
        }

        sw.stop();
        log.info(sw.prettyPrint());
        return result;
    }

@Transactional(readOnly = true)
public Page<PoiPagingResponseDTO> findAllPaging(int page, int size, Long buildingId, Integer floorNo, Long poiCategoryId, String keywordType, String keyword) {
    Pageable pageable = PageRequest.of(page, size);
    
    Page<Long> poiIdPage;
    if (hasSearchConditions(buildingId, floorNo, poiCategoryId, keywordType, keyword)) {
        poiIdPage = poiRepository.findPoiIdsForPagingWithSearch(pageable, buildingId, floorNo, poiCategoryId, keywordType, keyword);
    } else {
        poiIdPage = poiRepository.findPoiIdsForPaging(pageable);
    }
    
    List<Long> poiIds = poiIdPage.getContent();

    if (poiIds.isEmpty()) {
        return new PageImpl<>(List.of(), pageable, poiIdPage.getTotalElements());
    }
    List<Poi> poiList = poiRepository.findByIdsWithJoins(poiIds);

    List<PoiCctv> allCctvs = poiCctvRepository.findAllByPoiIn(poiList);

    Map<Long, List<PoiCctv>> cctvMap = allCctvs.stream()
        .collect(Collectors.groupingBy(poiCctv -> poiCctv.getPoi().getId()));
    
    List<PoiPagingResponseDTO> dtoList = poiList.stream()
        .map(poi -> {
            List<PoiCctvDTO> cctvDtoList = cctvMap.getOrDefault(poi.getId(), List.of()).stream()
                .map(PoiCctvDTO::from)
                .toList();

            return PoiPagingResponseDTO.builder()
                    .id(poi.getId())
                    .buildingId(poi.getBuilding().getId())
                    .floorNo(poi.getFloorNo())
                    .poiCategoryId(poi.getPoiCategory().getId())
                    .poiMiddleCategoryId(Optional.ofNullable(poi.getPoiMiddleCategory())
                            .map(PoiMiddleCategory::getId)
                            .orElse(null))
                    .iconSetId(poi.getIconSet().getId())
                    .position(poi.getPosition())
                    .rotation(poi.getRotation())
                    .scale(poi.getScale())
                    .name(poi.getName())
                    .code(poi.getCode())
                    .tagNames(poi.getTagNames())
                    .cctvList(cctvDtoList)
                    .isLight(poi.getIsLight())
                    .lightGroup(poi.getLightGroup())
                    .cameraIp(poi.getCameraIp())
                    .cameraId(poi.getCameraId())
                    .build();
        })
        .toList();

    return new PageImpl<>(dtoList, pageable, poiIdPage.getTotalElements());
}

private boolean hasSearchConditions(Long buildingId, Integer floorNo, Long poiCategoryId, String keywordType, String keyword) {
    return buildingId != null || floorNo != null || poiCategoryId != null ||
           (StringUtils.hasText(keywordType) && StringUtils.hasText(keyword));
}


    @Transactional(readOnly = true)
    public PoiAlarmDetailDTO findPoiDTOByTagName(String tagName){
        ArrayList<PoiCctvDTO> cctvDtoList = new ArrayList<>();
        SopResponseDTO firstByOrderByIdDesc = null;
        Poi poi = poiRepository.findPoiByTagName(tagName)
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI, "Not Found Poi with tagName: " + tagName));

        for(PoiCctv pc : poi.getPoiCctvs()){
            String cameraIp = poiCctvRepository.findCameraIpByPoiName(pc.getCctvName());
            PoiCctvDTO dto = PoiCctvDTO.builder()
                    .id(pc.getId())
                    .cctvName(pc.getCctvName())
                    .isMain(pc.getIsMain())
                    .cameraIp(cameraIp)
                    .build();
            cctvDtoList.add(dto);
        }

        if(poi.getPoiCategory().getId() == 4){
            firstByOrderByIdDesc = sopService.findFirstByOrderByIdDesc();
        }

        return poi.toPoiAlarmDetailDTO(cctvDtoList, firstByOrderByIdDesc);
    }

    @Transactional
    public Long save(@NotNull @Valid final CreatePoiDTO dto) {
        validateSaveCode(dto.code());
        validateSaveName(dto.name());
        // 임시 추가
        poiRepository.findByName(dto.name())
                .ifPresent(found -> {
                    throw new CustomException(ErrorCode.DUPLICATE_NAME, "Duplicate Poi Name : " + dto.name());
                });
        Poi poi = Poi.builder()
                .code(dto.code())
                .name(dto.name())
                .isLight(dto.isLight())
                .lightGroup(dto.lightGroup())
                .cameraIp(dto.cameraIp())
                .cameraId(dto.cameraId())
                .build();

        validateAssociation(dto);

        if (dto.floorNo() != null) {
            poi.changeFloorNo(dto.floorNo());
        }

        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.poiMiddleCategoryId(), poi::changePoiMiddleCategory, poiMiddleCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);

        if (dto.cctvList() != null && !dto.cctvList().isEmpty()) {
            List<PoiCctv> cctvEntities = dto.cctvList().stream()
                    .map(cctvData -> PoiCctv.builder()
                            .poi(poi)
                            .cctvName(cctvData.cctvName())
                            .isMain(cctvData.isMain())
                            .build())
                    .toList();
            poi.getPoiCctvs().addAll(cctvEntities);
        }
        PoiCategory category = poiCategoryRepository.findById(dto.poiCategoryId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI_CATEGORY));
        if (category.getName().equalsIgnoreCase("cctv")) {
            // cctv entity에도 추가
        }

        Poi savedPoi = poiRepository.save(poi);


        if (!ObjectUtils.isEmpty(dto.tagNames())) {
            for (String tagName : dto.tagNames()) {
                PoiTag poiTag = new PoiTag(tagName);
                poiTag.changePoi(savedPoi);
            }
        }

        return savedPoi.getId();
    }

    private void validateAssociation(CreatePoiDTO dto) {
        this.validateAssociation(UpdatePoiDTO.builder()
                .buildingId(dto.buildingId())
                .floorNo(dto.floorNo())
                .poiCategoryId(dto.poiCategoryId())
                .iconSetId(dto.iconSetId())
                .cctvList(dto.cctvList())
                .build());
    }

    private void validateAssociation(UpdatePoiDTO dto) {

        Building building = buildingRepository.findById(dto.buildingId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_BUILDING));

        BuildingFileHistory history = buildingFileHistoryRepository.findByBuildingVersion(building.getActiveVersion())
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        List<FloorHistory> floorHistories = floorHistoryRepository.findByBuildingFileHistoryId(history.getId());

        // floorNo가 null이 아닐 때만 층 검증 수행
        if (dto.floorNo() != null) {
            boolean isNoneMatchFloorId = floorHistories.stream()
                    .noneMatch(floor -> Objects.equals(floor.getFloor().getFloorNo(), dto.floorNo()));
            if (isNoneMatchFloorId) {
                throw new CustomException(ErrorCode.INVALID_FLOOR_WITH_BUILDING);
            }
        }

        PoiCategory category = poiCategoryRepository.findById(dto.poiCategoryId())
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        if(!category.getName().equalsIgnoreCase("cctv") && dto.cctvList() != null) {
            dto.cctvList().forEach(cctv -> {
                if(!poiRepository.existsCctvPoiByNameAndBuildingId(cctv.cctvName(), dto.buildingId())) {
                    throw new CustomException(NOT_FOUND_CCTV_POI, "해당 CCTV를 찾을 수 없습니다. 해당 건물에 등록된 CCTV인지 확인해주세요: " + cctv.cctvName());
                }
            });
        }


//        boolean isNoneMatchInPoiSet = building.getPoiSet().getPoiCategories().stream()
//                .filter(poiCategory -> poiCategory.getId().equals(dto.poiCategoryId()))
//                .flatMap(poiCategory -> poiCategory.getIconSets().stream())
//                .noneMatch(iconSet -> iconSet.getId().equals(dto.iconSetId()));
//
//        if (isNoneMatchInPoiSet) {
//            throw new CustomException(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
//        }
    }

    private void validateSaveCode(String code) {
        if (poiRepository.existsByCode(code)) {
            throw new CustomException(ErrorCode.DUPLICATED_POI_CODE);
        }
    }

    private void validateSaveName(String name) {
        if (poiRepository.existsByName(name)) {
            throw new CustomException(DUPLICATE_NAME);
        }
    }

    @Transactional
    public void updatePoi(@NotNull final Long id, @NotNull @Valid final UpdatePoiDTO dto) {
        List<PoiCctv> newCctvs = null;

        Poi poi = getPoi(id);
        validateUpdateCode(dto, poi);
        validateAssociation(dto);

        // CCTV 업데이트
        if (dto.cctvList() != null && !dto.cctvList().isEmpty()) {
            newCctvs = dto.cctvList().stream()
                    .map(c -> PoiCctv.builder()
                            .poi(poi)
                            .cctvName(c.cctvName())
                            .isMain(c.isMain())
                            .build())
                    .toList();
        }

        // 태그 업데이트
        if (!ObjectUtils.isEmpty(dto.tagNames())) {
            poi.updatePoiTags(dto.tagNames());
        }

        poi.update(dto.name(), dto.code(), newCctvs, dto.isLight(), dto.lightGroup(), dto.cameraIp(), dto.cameraId());

        if (dto.floorNo() != null) {
            poi.changeFloorNo(dto.floorNo());
        }

        if(dto.position() != null){
            poi.changePosition(dto.position());
        }

        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);
        updateIfNotNull(dto.poiMiddleCategoryId(), poi::changePoiMiddleCategory, poiMiddleCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
    }

    private void validateUpdateCode(UpdatePoiDTO dto, Poi poi) {
        if (!poi.getCode().equals(dto.code()) && poiRepository.existsByCode(dto.code())) {
            throw new CustomException(ErrorCode.DUPLICATED_POI_CODE);
        }
    }

    private <T, ID> void updateIfNotNull(final ID id, final Consumer<T> setter, final JpaRepository<T, ID> repository, final ErrorCode errorCode) {
        if (id != null) {
            Optional<T> optionalEntity = repository.findById(id);
            T entity = optionalEntity.orElseThrow(() -> new CustomException(errorCode));
            setter.accept(entity);
        }
    }


    @Transactional
    public void updatePosition(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, poi -> poi.changePosition(dto));
    }

    @Transactional
    public void updateRotation(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, poi -> poi.changeRotation(dto));
    }

    @Transactional
    public void updateScale(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, poi -> poi.changeScale(dto));
    }

    private void updateSpatial(Long id, Consumer<Poi> updateMethod) {
        Poi poi = getPoi(id);
        updateMethod.accept(poi);
    }

    @Transactional
    public void updateCameraId(Long id, String cameraId) {
        poiRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING))
                .updateCameraId(cameraId);
    }

    @Transactional
    public void delete(@NotNull final Long id) {
        Poi poi = getPoi(id);
        if("CCTV".equals(poi.getPoiCategory().getName())){
            poiCctvRepository.deleteByCctvName(poi.getName());
        }
        poiRepository.delete(poi);
    }

    @Transactional
    public void deleteAllById(@NotNull List<Long> ids) {
        for(Long id : ids) {
            Poi poi = poiRepository.findById(id)
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI, "Not Found Poi with id: " + id));
            if("CCTV".equals(poi.getPoiCategory().getName())){
                poiCctvRepository.deleteByCctvName(poi.getName());
            }
        }
        poiRepository.deleteAllById(ids);
    }

    @Transactional
    public void unAllocationPoi(List<Long> ids) {
        Spatial position = Spatial.builder()
                .x(null)
                .y(null)
                .z(null)
                .build();
        ids.forEach(id -> updateSpatial(id, poi -> poi.changePosition(position)));
    }

    // 일괄 등록 테스트
    @Transactional
    public void batchRegisterPoi(Long buildingId, Integer floorNo, MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            String ext = fileName.substring(fileName.lastIndexOf(".") + 1);
            if(!ext.equals("xlsx") && !ext.equals("xls") && !ext.equals("csv")){
                throw new CustomException(ErrorCode.INVALID_FILE);
            }

            // 엑셀 가져오기
            List<Map<String, Object>> rows = ExcelUtil.readExcelBatch(file);

            int headerLength = rows.get(0).size();

            List<Poi> result = new ArrayList<>();

            Building building = buildingRepository.findById(buildingId)
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_BUILDING));

            List<PoiCategory> poiCategoryList = poiCategoryRepository.findAll();
            List<PoiMiddleCategory> poiMiddleCategoryList = poiMiddleCategoryRepository.findAll();

            Map<String, Poi> poiMapByName = new LinkedHashMap<>();

            for(int i = 1; i < rows.size(); i++) {
                Map<String, String> poiMap = createMapByRows(rows, headerLength, i);
                existValidCheck(poiMap);

                String code = poiMap.get(POI_CODE.value);
                String name = poiMap.get(POI_NAME.value);
                List<String> tags = Arrays.stream(poiMap.get(TAG_NAME.value).split("[,\\n]"))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .toList();

                if (poiMapByName.containsKey(name)) {
                    Poi existingPoi = poiMapByName.get(name);
                    for (String tagName : tags) {
                        PoiTag poiTag = new PoiTag(tagName);
                        poiTag.changePoi(existingPoi);
                    }
                    continue;
                }

//                Optional<Poi> currentPoi = poiRepository.findByName(poiMap.get(POI_NAME.value));
//                if (currentPoi.isPresent()) {
//                    continue;
//                }
                if (poiRepository.existsByCode(poiMap.get(POI_CODE.value))) {
                    throw new CustomException(
                            ErrorCode.DUPLICATED_POI_CODE,
                            "중복된 POI 코드입니다. (" + poiMap.get(POI_CODE.value) + ")"
                    );
                }

                PoiCategory poiCategory = poiCategoryList.stream()
                        .filter(p -> p.getName().equalsIgnoreCase(poiMap.get(POI_CATEGORY_NAME.value)))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI_CATEGORY, "NotFound PoiCategory Name: " + poiMap.get(POI_CATEGORY_NAME.value)));

                PoiMiddleCategory poiMiddleCategory = poiMiddleCategoryList.stream()
                        .filter(m -> m.getPoiCategory().getId().equals(poiCategory.getId()))
                        .filter(m -> m.getName().equalsIgnoreCase(poiMap.get(POI_MIDDLE_CATEGORY_NAME.value)))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI_CATEGORY, "NotFound PoiMiddleCategory Name: " + poiMap.get(POI_MIDDLE_CATEGORY_NAME.value)));

                CreatePoiDTO.CreatePoiDTOBuilder poiDTOBuilder = CreatePoiDTO.builder()
                        .code(poiMap.get(POI_CODE.value))
                        .name(poiMap.get(POI_NAME.value))
                        .buildingId(building.getId())
                        .floorNo(floorNo)
                        .poiCategoryId(poiCategory.getId())
                        .iconSetId(poiMiddleCategory.getIconSets().get(0).getId())
                        .poiMiddleCategoryId(poiMiddleCategory.getId())
                        .tagNames(tags);

                Poi.PoiBuilder poiBuilder = Poi.builder()
                        .code(poiMap.get(POI_CODE.value))
                        .name(poiMap.get(POI_NAME.value));

                String lightGroup = poiMap.get(LIGHT_GROUP.value);
                boolean isLight = lightGroup != null && !lightGroup.isBlank();

                poiDTOBuilder.lightGroup(lightGroup != null ? lightGroup : "")
                        .isLight(isLight);
                poiBuilder.lightGroup(lightGroup != null ? lightGroup : "")
                        .isLight(isLight);

                List<PoiCctvDTO> cctvDTOList = Collections.emptyList();
                if (!poiCategory.getName().equalsIgnoreCase("cctv")) {
                    cctvDTOList = new ArrayList<>();
                    Set<String> cctvNames = new HashSet<>();

                    // 메인 CCTV 추가
                    String mainCctv = poiMap.get(MAIN_CCTV.value);
                    if (mainCctv != null && !mainCctv.isBlank()) {
                        String trimmedMainCctv = mainCctv.trim();
                        cctvNames.add(trimmedMainCctv);
                        cctvDTOList.add(
                                PoiCctvDTO.builder()
                                        .cctvName(trimmedMainCctv)
                                        .isMain("Y")
                                        .build()
                        );
                    }

                    // 서브 CCTV 추가 (중복 검증 포함)
                    for (String key : List.of(SUB_CCTV1.value, SUB_CCTV2.value, SUB_CCTV3.value, SUB_CCTV4.value)) {
                        String subCctv = poiMap.get(key);
                        if (subCctv != null && !subCctv.isBlank()) {
                            String trimmedSubCctv = subCctv.trim();
                            if (cctvNames.contains(trimmedSubCctv)) {
                                throw new CustomException(DUPLICATE_CCTV_NAME,
                                        String.format("중복된 CCTV 이름이 있습니다: %s", trimmedSubCctv));
                            }
                            cctvNames.add(trimmedSubCctv);
                            cctvDTOList.add(
                                    PoiCctvDTO.builder()
                                            .cctvName(trimmedSubCctv)
                                            .isMain("N")
                                            .build()
                            );
                        }
                    }

                    poiDTOBuilder.cctvList(cctvDTOList);
                }

                CreatePoiDTO poiDto = poiDTOBuilder.build();
                Poi poi = poiBuilder.build();

                for (PoiCctvDTO dto : cctvDTOList) {
                    PoiCctv cctv = PoiCctv.builder()
                            .poi(poi)
                            .cctvName(dto.cctvName())
                            .isMain(dto.isMain())
                            .build();
                    poi.getPoiCctvs().add(cctv);
                }

                changeField(poiDto, poi);
                poiMapByName.put(name, poi);
                result.add(poi);
            }
                for (Poi poi : result) {
                    // CreatePoiDTO로 변환하여 검증
                    CreatePoiDTO validationDto = CreatePoiDTO.builder()
                            .buildingId(building.getId())
                            .floorNo(floorNo)
                            .poiCategoryId(poi.getPoiCategory().getId())
                            .cctvList(poi.getPoiCctvs().stream()
                                    .map(cctv -> new PoiCctvDTO(cctv.getCctvName(), cctv.getIsMain()))
                                    .toList())
                            .build();

                    validateAssociation(validationDto);
                }



            try {
                poiRepository.saveAll(result);

            } catch(InvalidDataAccessResourceUsageException | DataIntegrityViolationException e) {
                if(e.getRootCause().getMessage().contains("Data too long for column")) {
                    String errorMessage = e.getRootCause().getMessage();

                    Pattern pattern = Pattern.compile("'(.*?)'");
                    Matcher matcher = pattern.matcher(errorMessage);

                    if (matcher.find()) {
                        String columnName = matcher.group(1);
                        throw new CustomException(ErrorCode.TOO_LONG_EXCEL_FIELD, columnName);
                    } else {
                        throw new CustomException(ErrorCode.TOO_LONG_EXCEL_FIELD);
                    }
                }

                throw new CustomException(FAILED_BATCH_REGISTER_POI);
            }

        } catch(IOException e) {
            throw new CustomException(ErrorCode.FAILED_BATCH_REGISTER_POI);
        }
    }

    @Transactional
    public void addCctvToPois(List<AddCctvToPoisDTO> dtoList, Long buildingId, Integer floorNo) {

        poiCctvRepository.deleteByBuildingIdAndFloorNo(buildingId, floorNo);

        for (AddCctvToPoisDTO dto : dtoList) {
            // 1. CCTV인 POI 조회
            Poi cctvPoi = getPoi(dto.cctvPoiId());

            // 2. CCTV 카테고리인지 확인
            if (!cctvPoi.getPoiCategory().getName().equalsIgnoreCase("cctv")) {
                throw new CustomException(ErrorCode.INVALID_POI_CATEGORY_WITH_POI_SET);
            }

            // 3. 대상 POI들 조회
            List<Poi> targetPois = poiRepository.findAllById(dto.targetPoiIds());

            // 4. 각 대상 POI에 CCTV 정보 추가
            for (Poi targetPoi : targetPois) {
                // 이미 같은 CCTV가 연결되어 있는지 확인
                boolean alreadyExists = targetPoi.getPoiCctvs().stream()
                        .anyMatch(cctv -> cctv.getCctvName().equals(cctvPoi.getName()));

                if (!alreadyExists) {
                    PoiCctv newCctv = PoiCctv.builder()
                            .poi(targetPoi)
                            .cctvName(cctvPoi.getName())  // CCTV POI의 이름을 CCTV 이름으로 사용
                            .isMain("Y")
                            .build();

                    targetPoi.getPoiCctvs().add(newCctv);
                }
            }
        }
    }

    public Map<Long, Set<Long>> getPoiIdsGroupedByCctvPoiId(Long buildingId, Integer floorNo) {
        List<PoiCctvResponseDTO> dtos = poiCctvRepository.findByBuildingIdAndFloorNo(buildingId, floorNo);
        return dtos.stream()
                .collect(Collectors.groupingBy(
                        PoiCctvResponseDTO::getCctvPoiId,
                        Collectors.mapping(PoiCctvResponseDTO::getPoiId, Collectors.toSet())
                ));
    }

    @NotNull
    private Map<String, String> createMapByRows(List<Map<String, Object>> rows, int headerLength, int i) {
        Map<String, String> workMap = new HashMap<>();
        for(int j = 0; j < headerLength; j++) {
            String o = String.valueOf(rows.get(i).get(String.valueOf(j)));
            workMap.put(String.valueOf(rows.get(0).get(String.valueOf(j))), o);
        }
        return workMap;
    }

    private void existValidCheck(Map<String, String> poiMap) {

        if (poiMap.get(POI_CATEGORY_NAME.value) == null || poiMap.get(POI_CATEGORY_NAME.value).equals("")) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_EXCEL_FIELD);
        } else if (poiMap.get(POI_CODE.value) == null || poiMap.get(POI_CODE.value).equals("")) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_EXCEL_FIELD);
        } else if (poiMap.get(POI_NAME.value) == null || poiMap.get(POI_NAME.value).equals("")) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_EXCEL_FIELD);
        } else if (poiMap.get(POI_MIDDLE_CATEGORY_NAME.value) == null || poiMap.get(POI_MIDDLE_CATEGORY_NAME.value).equals("")) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_EXCEL_FIELD);
        }
    }

    private void changeField(CreatePoiDTO dto, Poi poi) {

        dto.tagNames().forEach(tagName -> {
            PoiTag poiTag = new PoiTag(tagName);
            poiTag.changePoi(poi);
        });


        if (dto.floorNo() != null) {
            poi.changeFloorNo(dto.floorNo());
        }
        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);
        updateIfNotNull(dto.poiMiddleCategoryId(), poi::changePoiMiddleCategory, poiMiddleCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
    }
}
