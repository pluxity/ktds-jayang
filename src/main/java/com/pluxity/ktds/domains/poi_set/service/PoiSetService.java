package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.building.dto.BuildingDetailResponseDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiSetRepository;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class PoiSetService {

    private final PoiSetRepository repository;

    private final PoiCategoryRepository poiCategoryRepository;

    public PoiSetResponseDTO findById(Long id) {
        PoiSet poiSet = repository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_ID));

        return poiSet.toDto();
    }

    public List<PoiSetResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(PoiSet::toDto)
                .toList();
    }

    @Transactional
    public Long save(PoiSetRequestDTO dto) {

        repository.findByName(dto.name()).ifPresent((found) -> {
            throw new CustomException(DUPLICATE_NAME);
        });

        PoiSet poiSet = PoiSet.builder()
                .name(dto.name())
                .build();

        updatePoiCategories(poiSet, dto.poiCategoryIds());

        PoiSet savePoiSet = repository.save(poiSet);

        return savePoiSet.getId();
    }

    @Transactional
    public void update(Long id, PoiSetRequestDTO dto) {
        PoiSet fetchPoiSet = repository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_ID);
        });

        if (StringUtils.isNotBlank(dto.name())) {
            fetchPoiSet.updateName(dto.name());
        }

        updatePoiCategories(fetchPoiSet, dto.poiCategoryIds());
    }

    private void updatePoiCategories(@NotNull PoiSet poiSet, List<Long> poiCategoryIds) {
        if (poiCategoryIds != null) {
            poiSet.updatePoiCategories(poiCategoryIds.stream()
                    .map(id -> poiCategoryRepository.findById(id).orElseThrow(() -> {
                        throw new CustomException(NOT_FOUND_POI_CATEGORY_ID);
                    }))
                    .toList()
            );
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }


    public List<BuildingDetailResponseDTO> findBuildingsByPoiSetId(Long id) {
        return repository.findByPoiSetId(id).stream()
                .map(Building::toDetailResponseDTO)
                .toList();
    }
}
