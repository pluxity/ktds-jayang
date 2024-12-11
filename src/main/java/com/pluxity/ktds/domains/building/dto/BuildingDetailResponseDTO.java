package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.LodSettings;
import lombok.Builder;

import java.util.List;

@Builder
public record BuildingDetailResponseDTO(
        Long id,
        String code,
        String name,
        String description,
        String topology,
        LodSettings lodSettings,
        FileInfoDTO buildingFile,
        List<Long> floorIds,
        Long poiSetId
) {
}
