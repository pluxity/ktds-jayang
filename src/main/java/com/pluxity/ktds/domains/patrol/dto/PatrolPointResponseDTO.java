package com.pluxity.ktds.domains.patrol.dto;


import lombok.Builder;

import java.util.List;

@Builder
public record PatrolPointResponseDTO(
        Long id,

        Long floorId,

        String name,

        Integer sortOrder,

        String pointLocation,

        List<Long> pois
){}
