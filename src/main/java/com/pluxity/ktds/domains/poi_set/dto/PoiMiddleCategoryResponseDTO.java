package com.pluxity.ktds.domains.poi_set.dto;

import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import lombok.Builder;

@Builder
public record PoiMiddleCategoryResponseDTO(
        Long id,
        String name,
        PoiCategoryResponseDTO poiCategory
) {
}
