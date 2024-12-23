package com.pluxity.ktds.domains.patrol.dto;


import com.pluxity.ktds.domains.patrol.entity.Spatial;
import jakarta.validation.Valid;
import lombok.Builder;

@Builder
@Valid
public record CreatePatrolPointDTO(
        Long floorId,
        Spatial pointLocation
){

}
