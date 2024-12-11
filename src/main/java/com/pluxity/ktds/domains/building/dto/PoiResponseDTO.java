package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

@Builder
public record PoiResponseDTO(
        Long id,
        String code,
        String name
) {
}
