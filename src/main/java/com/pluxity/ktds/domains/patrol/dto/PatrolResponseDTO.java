package com.pluxity.ktds.domains.patrol.dto;


import lombok.Builder;

import java.util.List;

@Builder
public record PatrolResponseDTO(
        Long id,

        Long buildingId,

        String name,

        List<PatrolPointResponseDTO> patrolPoints
){}
