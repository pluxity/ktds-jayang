package com.pluxity.ktds.domains.poi_set.dto;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import lombok.Builder;

import java.util.List;

@Builder
public record PoiCategoryResponseDTO(
        Long id,
        String name,
        FileInfo imageFile,
        List<IconSetResponseDTO> iconSets
) {
}
