package com.pluxity.ktds.domains.patrol.dto;


import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record PatrolResponseDTO(
        Long id,

        Long buildingId,

        String name,

        List<PatrolPointResponseDTO> patrolPoints,

        LocalDateTime createdAt
){}
