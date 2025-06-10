package com.pluxity.ktds.domains.patrol.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record CreatePatrolDTO(
        Long buildingId,

        String name,

        List<CreatePatrolPointDTO> patrolPointRequestDTOs
){}
