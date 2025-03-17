package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiMiddleCategoryRepository;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class PoiMiddleCategoryService {

    private final PoiCategoryRepository poiCategoryRepository;
    private final PoiMiddleCategoryRepository poiMiddleCategoryRepository;
    private final PoiRepository poiRepository;

    public PoiMiddleCategoryResponseDTO findById(Long id) {
        PoiMiddleCategory fetchPoiCategory = poiMiddleCategoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_ID));

        return fetchPoiCategory.toDto();
    }

    public List<PoiMiddleCategoryResponseDTO> findAll() {
        return poiMiddleCategoryRepository.findAll()
                .stream()
                .map(PoiMiddleCategory::toDto)
                .toList();
    }

    @Transactional
    public Long save(PoiMiddleCategoryRequestDTO dto) {
        if (poiMiddleCategoryRepository.existsByNameAndPoiCategoryId(dto.name(), dto.majorCategory())) {
            throw new CustomException(DUPLICATE_NAME);
        }
        PoiCategory poiCategory = poiCategoryRepository.findById(dto.majorCategory())
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        PoiMiddleCategory poiMiddleCategory = PoiMiddleCategory.builder()
                .name(dto.name())
                .poiCategory(poiCategory)
                .build();

        PoiMiddleCategory savedEntity = poiMiddleCategoryRepository.save(poiMiddleCategory);
        return savedEntity.getId();
    }

    @Transactional
    public void update(Long id, PoiMiddleCategoryRequestDTO dto) {
        PoiMiddleCategory poiMiddleCategory = poiMiddleCategoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        PoiCategory poiCategory = poiCategoryRepository.findById(dto.majorCategory())
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        poiMiddleCategory = PoiMiddleCategory.builder()
                .name(dto.name())
                .poiCategory(poiCategory)
                .build();

        poiMiddleCategoryRepository.save(poiMiddleCategory);
    }

    @Transactional
    public void delete(Long id) {
        poiRepository.findByPoiCategoryId(id).ifPresent(poiCategory -> {
            throw new CustomException(EXIST_POI_CONTAINING_CATEGORY);
        });
        poiMiddleCategoryRepository.deleteById(id);
    }
}
