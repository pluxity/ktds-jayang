package com.pluxity.ktds.domains.poi_set.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record PoiSetResponseDTO(
        Long id,
        String name,
        List<PoiCategorySummaryDTO> poiCategories
) {
}
