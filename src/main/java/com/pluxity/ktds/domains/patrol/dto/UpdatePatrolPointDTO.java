package com.pluxity.ktds.domains.patrol.dto;


import com.pluxity.ktds.domains.patrol.entity.Spatial;
import lombok.Builder;

@Builder
public record UpdatePatrolPointDTO(
        String name
){

}