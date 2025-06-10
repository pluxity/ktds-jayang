package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record FloorDetailResponseDTO (
        Long id,
        String name,
        Integer no,
        List<SbmFloorDTO> sbmFloor
){}
