package com.pluxity.ktds.domains.patrol.dto;


import lombok.Builder;

import java.util.List;

@Builder
public record UpdatePatrolDTO(
        Long buildingId,

        String name,

        List<UpdatePatrolPointDTO> patrolPointRequestDTOs
){}
