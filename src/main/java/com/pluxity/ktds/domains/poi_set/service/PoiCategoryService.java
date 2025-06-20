package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class PoiCategoryService {

    private final FileInfoService fileService;

    private final PoiCategoryRepository repository;

    private final SaveImage imageStrategy;
    private final PoiRepository poiRepository;

    public PoiCategoryResponseDTO findById(Long id) {
        PoiCategory fetchPoiCategory = repository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_ID));

        return fetchPoiCategory.toDto();
    }

    public List<PoiCategoryResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(PoiCategory::toDto)
                .toList();
    }

    @Transactional
    public FileInfoDTO saveImageFile(@NotNull MultipartFile multipartFile) throws IOException {
        return fileService.saveFile(multipartFile, FileEntityType.CATEGORY_IMAGE, imageStrategy);
    }

    @Transactional
    public Long save(PoiCategoryRequestDTO dto) {

        Optional<PoiCategory> fetchPoiCategory = repository.findByName(dto.name());
        if (fetchPoiCategory.isPresent()) {
            throw new CustomException(DUPLICATE_NAME);
        }

        PoiCategory poiCategory = PoiCategory.builder()
                .name(dto.name())
                .build();

        PoiCategory savePoiCategory = repository.save(poiCategory);
        return savePoiCategory.getId();
    }

    @Transactional
    public void update(Long id, PoiCategoryRequestDTO dto) {
        PoiCategory fetchPoiCategory = repository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_ID);
        });

        if (StringUtils.isNotBlank(dto.name())) {
            fetchPoiCategory.updateName(dto.name());
        }
    }

    @Transactional
    public void delete(Long id) {

        poiRepository.findByPoiCategoryId(id).ifPresent(poiCategory -> {
            throw new CustomException(EXIST_POI_CONTAINING_CATEGORY);
        });
        repository.deleteById(id);
    }

}
