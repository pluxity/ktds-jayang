package com.pluxity.ktds.domains.patrol.dto;


import com.pluxity.ktds.domains.patrol.entity.Spatial;
import jakarta.validation.Valid;
import lombok.Builder;

import java.util.List;

@Builder
@Valid
public record CreatePatrolPointDTO(
        Integer floorNo,
        String floorName,
        Spatial pointLocation,
        List<Long> pois
){

}
