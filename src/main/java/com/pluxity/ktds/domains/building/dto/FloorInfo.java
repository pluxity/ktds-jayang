package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

@Builder
public record FloorInfo(
        String floorId,
        String floorDisplayName,
        String floorBaseFloor
) {}