package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record PoiResponseDTO(
        Long id,
        String code,
        String name,
        List<String> tagNames,
        Boolean isLight,
        String lightGroup,
        String cameraIp
) {
}
