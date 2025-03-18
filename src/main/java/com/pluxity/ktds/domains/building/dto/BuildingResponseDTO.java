package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

@Builder
public record BuildingResponseDTO(
        Long id,
        String code,
        String name,
        String description,
        String isIndoor,
        String camera2d
) {
}
