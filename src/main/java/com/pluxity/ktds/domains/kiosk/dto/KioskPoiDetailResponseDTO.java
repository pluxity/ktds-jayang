package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import lombok.Builder;

@Builder
public record KioskPoiDetailResponseDTO(
        Long id,
        boolean isKiosk,
        String kioskCode,
        String name,
        Long buildingId,
        Integer floorNo,
        String description,
        Spatial position,
        Spatial rotation,
        Spatial scale
) {
}
