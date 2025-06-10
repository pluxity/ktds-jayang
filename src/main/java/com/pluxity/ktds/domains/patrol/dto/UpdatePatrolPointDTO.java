package com.pluxity.ktds.domains.patrol.dto;


import com.pluxity.ktds.domains.patrol.entity.Spatial;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdatePatrolPointDTO(
        @NotNull
        String name
){

}
