package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiMiddleCategoryRepository;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class PoiMiddleCategoryService {

    private final FileInfoService fileService;

    private final PoiCategoryRepository poiCategoryRepository;
    private final PoiMiddleCategoryRepository poiMiddleCategoryRepository;
    private final IconSetRepository iconSetRepository;
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

        Optional<IconSet> iconSet = iconSetRepository.findById(dto.iconSetIds().get(0));
        Long imageFileId = iconSet.map(IconSet::getIconFile2D)
                .map(FileInfo::getId)
                .orElse(null);

        updateIconFile(poiMiddleCategory, imageFileId);
        updateIconSets(poiMiddleCategory, dto.iconSetIds());

        PoiMiddleCategory savedEntity = poiMiddleCategoryRepository.save(poiMiddleCategory);
        return savedEntity.getId();
    }

    @Transactional
    public void update(Long id, PoiMiddleCategoryRequestDTO dto) {
        PoiMiddleCategory poiMiddleCategory = poiMiddleCategoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        PoiCategory poiCategory = poiCategoryRepository.findById(dto.majorCategory())
                .orElseThrow(() -> new CustomException(NOT_FOUND_POI_CATEGORY));

        Optional<IconSet> iconSetOptional = iconSetRepository.findById(dto.iconSetIds().get(0));

        Long imageFileId = iconSetOptional
                .map(IconSet::getIconFile2D)
                .map(FileInfo::getId)
                .orElse(null);

        IconSet iconSet = iconSetOptional
                .orElseThrow(() -> new CustomException(NOT_FOUND_ICON_SET));

        List<Poi> poiList = poiRepository.findByPoiMiddleCategoryId(id);
        for (Poi poi : poiList) {
            poi.changeIconSet(iconSet);
        }

        poiMiddleCategory.updateName(dto.name());
        poiMiddleCategory.updatePoiCategory(poiCategory);

        updateIconFile(poiMiddleCategory, imageFileId);
        updateIconSets(poiMiddleCategory, dto.iconSetIds());

        poiMiddleCategoryRepository.save(poiMiddleCategory);
    }

    @Transactional
    public void delete(Long id) {
        if (poiRepository.existsByPoiMiddleCategoryId(id)) {
            throw new CustomException(EXIST_POI_CONTAINING_CATEGORY);
        }
        poiMiddleCategoryRepository.deleteById(id);
    }

    private void updateIconSets(@NotNull PoiMiddleCategory poiCategory, List<Long> iconSetIds) throws CustomException {
        if (iconSetIds != null) {
            poiCategory.updateIconSets(iconSetIds.stream()
                    .map(id -> iconSetRepository.findById(id).orElseThrow(() -> {
                        throw new CustomException(NOT_FOUND_ICON_SET);
                    }))
                    .toList()
            );
        }
    }

    private void updateIconFile(@NotNull PoiMiddleCategory poiCategory, Long fileId) {
        if (fileId != null) {
            FileInfo fileInfo = fileService.findById(fileId);
            poiCategory.updateImageFile(fileInfo);
        }
    }

}
