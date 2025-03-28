package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.dto.CreatePoiDTO;
import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdatePoiDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.Cctv;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import com.pluxity.ktds.domains.cctv.repository.CctvRepository;
import com.pluxity.ktds.domains.cctv.repository.PoiCctvRepository;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiMiddleCategoryRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.ExcelUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ExcelHeaderNameCode.*;
import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
@Validated
public class PoiService {

    private final PoiRepository poiRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final PoiCategoryRepository poiCategoryRepository;
    private final IconSetRepository iconSetRepository;
    private final PoiMiddleCategoryRepository poiMiddleCategoryRepository;
    private final EventRepository eventRepository;
    private final CctvRepository cctvRepository;
    private final PoiCctvRepository poiCctvRepository;
    private final TagClientService tagClientService;

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
    public List<PoiDetailResponseDTO> findPoisByFloorId(@NotNull final Long id) {
        return poiRepository.findPoisByfloorId(id).stream()
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
        List<Poi> poiList = poiRepository.findAll();

        return poiList.stream()
                .map(poi -> {
                    List<PoiCctv> cctvs = poiCctvRepository.findAllByPoi(poi);

                    List<PoiCctvDTO> cctvDtoList = cctvs.stream()
                            .map(PoiCctvDTO::from)
                            .toList();

                    PoiDetailResponseDTO base = poi.toDetailResponseDTO();

                    return PoiDetailResponseDTO.builder()
                            .id(base.id())
                            .buildingId(base.buildingId())
                            .floorId(base.floorId())
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
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Poi findPoiIdsByTagName(String tagName){
        return poiRepository.findPoiByTagName(tagName);
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
                .tagNames(dto.tagNames() != null ? new ArrayList<>(dto.tagNames()) : new ArrayList<>())
                .build();

        validateAssociation(dto);

        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.poiMiddleCategoryId(), poi::changePoiMiddleCategory, poiMiddleCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);

        if (dto.cctvList() != null && !dto.cctvList().isEmpty()) {
            List<PoiCctv> cctvEntities = dto.cctvList().stream()
                    .map(cctvData -> PoiCctv.builder()
                            .poi(poi)
                            .code(cctvData.code())
                            .isMain(cctvData.isMain())
                            .build())
                    .toList();
            poi.getPoiCctvs().addAll(cctvEntities);
        }
        Poi savedPoi = poiRepository.save(poi);
        if (dto.tagNames() != null) {
            tagClientService.addTags(dto.tagNames());
        }

        return savedPoi.getId();
    }

    private void validateAssociation(CreatePoiDTO dto) {
        this.validateAssociation(UpdatePoiDTO.builder()
                        .buildingId(dto.buildingId())
                        .floorId(dto.floorId())
                        .poiCategoryId(dto.poiCategoryId())
                        .iconSetId(dto.iconSetId())
                        .build());
    }

    private void validateAssociation(UpdatePoiDTO dto) {

        Building building = buildingRepository.findById(dto.buildingId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_BUILDING));

        boolean isNoneMatchFloorId = building.getFloors().stream()
                .noneMatch(floor -> floor.getId().equals(dto.floorId()));
        if (isNoneMatchFloorId) {
            throw new CustomException(ErrorCode.INVALID_FLOOR_WITH_BUILDING);
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
        Poi poi = getPoi(id);
        validateUpdateCode(dto, poi);
        validateAssociation(dto);

        List<PoiCctv> newCctvs = dto.cctvList().stream()
                .map(c -> PoiCctv.builder()
                        .poi(poi)
                        .code(c.code())
                        .isMain(c.isMain())
                        .build())
                .toList();
        poi.update(dto.name(), dto.code(), dto.tagNames(), newCctvs);
        if (dto.tagNames() != null) {
            tagClientService.addTags(dto.tagNames());
        }
        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
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
    public void delete(@NotNull final Long id) {
        Poi poi = getPoi(id);
        poiRepository.delete(poi);
    }

    @Transactional
    public void deleteAllById(@NotNull List<Long> ids) {
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
    public void batchRegisterPoi(Long buildingId, Long floorId, MultipartFile file) {
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
            Floor floor = floorRepository.findById(floorId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_FLOOR));

            List<PoiCategory> poiCategoryList = poiCategoryRepository.findAll();
            List<IconSet> iconSetList = iconSetRepository.findAll();
            List<PoiMiddleCategory> poiMiddleCategoryList = poiMiddleCategoryRepository.findAll();

            for(int i = 1; i < rows.size(); i++) {
                Map<String, String> poiMap = createMapByRows(rows, headerLength, i);
                existValidCheck(poiMap);

                poiRepository.findByName(poiMap.get(POI_NAME.value))
                        .ifPresent(found -> {
                            throw new CustomException(ErrorCode.DUPLICATE_NAME, "Duplicate Poi Name : " + poiMap.get(POI_NAME.value));
                        });

                if (poiRepository.existsByCode(poiMap.get(POI_CODE.value))) {
                    throw new CustomException(ErrorCode.DUPLICATED_POI_CODE, "Duplcate Poi Code: " + poiMap.get(POI_CODE.value));
                }

                PoiCategory poiCategory = poiCategoryList.stream()
                        .filter(p -> p.getName().equalsIgnoreCase(poiMap.get(POI_CATEGORY_NAME.value)))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI_CATEGORY, "NotFound PoiCategory Name: " + poiMap.get(POI_CATEGORY_NAME.value)));

                IconSet iconSet = iconSetList.stream()
                        .filter(c -> c.getName().equalsIgnoreCase(poiMap.get(POI_ICONSET_NAME.value)))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ICON_SET, "NotFound Iconset Name: " + poiMap.get(POI_ICONSET_NAME.value)));

                PoiMiddleCategory poiMiddleCategory = poiMiddleCategoryList.stream()
                        .filter(m -> m.getPoiCategory().getId().equals(poiCategory.getId()))
                        .filter(m -> m.getName().equalsIgnoreCase(poiMap.get(POI_MIDDLE_CATEGORY_NAME.value)))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI_CATEGORY, "NotFound PoiMiddleCategory Name: " + poiMap.get(POI_MIDDLE_CATEGORY_NAME.value)));

                if(poiCategory.getIconSets().get(0).getId() != iconSet.getId()) {
                    throw new CustomException(ErrorCode.INVALID_ICON_SET_ASSOCIATION,
                            "Not Associate - PoiCategory : " + poiMap.get(POI_CATEGORY_NAME.value)
                                    + "/ Iconset: " + poiMap.get(POI_ICONSET_NAME.value));
                }

                List<String> tags = Arrays.stream(poiMap.get(TAG_NAME.value).split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .toList();
                CreatePoiDTO poiDto = CreatePoiDTO.builder()
                        .code(poiMap.get(POI_CODE.value))
                        .name(poiMap.get(POI_NAME.value))
                        .buildingId(building.getId())
                        .floorId(floor.getId())
                        .poiCategoryId(poiCategory.getId())
                        .iconSetId(iconSet.getId())
                        .poiMiddleCategoryId(poiMiddleCategory.getId())
                        .tagNames(tags)
                        .build();

                Poi poi = Poi.builder()
                        .code(poiMap.get(POI_CODE.value))
                        .name(poiMap.get(POI_NAME.value))
                        .tagNames(tags)
                        .build();

                changeField(poiDto, poi);

                result.add(poi);
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
        } else if (poiMap.get(POI_ICONSET_NAME.value) == null || poiMap.get(POI_ICONSET_NAME.value).equals("")) {
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
        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);
        updateIfNotNull(dto.poiMiddleCategoryId(), poi::changePoiMiddleCategory, poiMiddleCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
    }
}
