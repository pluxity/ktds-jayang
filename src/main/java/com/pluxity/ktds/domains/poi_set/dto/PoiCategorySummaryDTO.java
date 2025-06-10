package com.pluxity.ktds.domains.poi_set.dto;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import lombok.Builder;

@Builder
public record PoiCategorySummaryDTO(
        Long id,
        FileInfo imageFile,
        String name
) {
}
