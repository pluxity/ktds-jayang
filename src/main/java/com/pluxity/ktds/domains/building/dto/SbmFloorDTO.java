package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

@Builder
public record SbmFloorDTO(
        Long id,
        String sbmFloorId,
        String sbmFileName,
        String sbmFloorBase,
        String sbmFloorGroup,
        String sbmFloorName,
        String isMain
) {
}
