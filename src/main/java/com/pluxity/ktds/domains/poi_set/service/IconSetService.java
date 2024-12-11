package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetFileRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;

import static com.pluxity.ktds.global.constant.ErrorCode.DUPLICATE_NAME;
import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_ID;

@Service
@RequiredArgsConstructor
public class IconSetService {

    private final FileInfoService fileService;

    private final IconSetRepository repository;

    public IconSetResponseDTO findById(Long id) {

        IconSet fetchIconSet = repository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_ID));

        return fetchIconSet.toDto();
    }

    public List<IconSetResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(IconSet::toDto)
                .toList();
    }

    @Transactional
    public FileInfoDTO saveIconFile(@NotNull IconSetFileRequestDTO dto) throws IOException {
        return fileService.saveFile(dto.file(), dto.type(), dto.strategy());
    }

    @Transactional
    public Long save(IconSetRequestDTO dto) {

        repository.findByName(dto.name())
                .ifPresent(found -> {
                    throw new CustomException(DUPLICATE_NAME);
                });


        IconSet iconSet = IconSet.builder()
                .name(dto.name())
                .build();

        updateIcons(dto.iconFile2DId(), iconSet::updateFileInfo2D);
        updateIcons(dto.iconFile3DId(), iconSet::updateFileInfo3D);

        IconSet savedIconSet = repository.save(iconSet);
        return savedIconSet.getId();
    }

    @Transactional
    public void update(Long id, IconSetRequestDTO dto) {

        IconSet fetchIconSet = repository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_ID);
        });

        if (StringUtils.isNotBlank(dto.name())) {
            fetchIconSet.updateName(dto.name());
        }

        updateIcons(dto.iconFile2DId(), fetchIconSet::updateFileInfo2D);
        updateIcons(dto.iconFile3DId(), fetchIconSet::updateFileInfo3D);
    }


    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private void updateIcons(Long iconFileId, Consumer<FileInfo> updater) {
        if (iconFileId != null) {
            FileInfo fileInfo = fileService.findById(iconFileId);
            updater.accept(fileInfo);
        }
    }

}
