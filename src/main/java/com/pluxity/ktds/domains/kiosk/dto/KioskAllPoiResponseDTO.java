package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import lombok.Builder;

@Builder
public record KioskAllPoiResponseDTO(
        Long id,
        String name,
        boolean isKiosk,
        Long buildingId,
        String category,
        Integer floorNo,
        Spatial position,
        Spatial rotation,
        Spatial scale
) {}
