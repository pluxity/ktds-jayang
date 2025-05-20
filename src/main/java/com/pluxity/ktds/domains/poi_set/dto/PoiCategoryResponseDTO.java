package com.pluxity.ktds.domains.poi_set.dto;
import lombok.Builder;


@Builder
public record PoiCategoryResponseDTO(
        Long id,
        String name
) {
}
