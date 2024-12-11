package com.pluxity.ktds.domains.building.service;

import com.pluxity.ktds.domains.building.dto.CreatePoiDTO;
import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdatePoiDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Validated
public class PoiService {

    private final PoiRepository poiRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final PoiCategoryRepository poiCategoryRepository;
    private final IconSetRepository iconSetRepository;

    private Poi getPoi(Long id) {
        return poiRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_POI));
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

    @Transactional
    public Long save(@NotNull @Valid final CreatePoiDTO dto) {
        validateSaveCode(dto.code());
        Poi poi = Poi.builder()
                .code(dto.code())
                .name(dto.name())
                .build();

        validateAssociation(dto);

        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);

        return poiRepository.save(poi).getId();
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

        boolean isNoneMatchInPoiSet = building.getPoiSet().getPoiCategories().stream()
                .filter(poiCategory -> poiCategory.getId().equals(dto.poiCategoryId()))
                .flatMap(poiCategory -> poiCategory.getIconSets().stream())
                .noneMatch(iconSet -> iconSet.getId().equals(dto.iconSetId()));

        if (isNoneMatchInPoiSet) {
            throw new CustomException(ErrorCode.INVALID_ICON_SET_ASSOCIATION);
        }
    }

    private void validateSaveCode(String code) {
        if (poiRepository.existsByCode(code)) {
            throw new CustomException(ErrorCode.DUPLICATED_POI_CODE);
        }
    }

    @Transactional
    public void updatePoi(@NotNull final Long id, @NotNull @Valid final UpdatePoiDTO dto) {
        Poi poi = getPoi(id);
        validateUpdateCode(dto, poi);
        validateAssociation(dto);

        poi.update(dto.name(), dto.code());

        updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
        updateIfNotNull(dto.poiCategoryId(), poi::changePoiCategory, poiCategoryRepository, ErrorCode.NOT_FOUND_POI_CATEGORY);
        updateIfNotNull(dto.iconSetId(), poi::changeIconSet, iconSetRepository, ErrorCode.NOT_FOUND_ICON_SET);
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

}
