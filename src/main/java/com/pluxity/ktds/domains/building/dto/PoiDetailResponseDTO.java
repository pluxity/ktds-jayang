package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import lombok.Builder;

@Builder
public record PoiDetailResponseDTO(
        Long id,
        Long buildingId,
        Long floorId,
        Long poiCategoryId,
        Long poiMiddleCategoryId,
        Long iconSetId,
        Spatial position,
        Spatial rotation,
        Spatial scale,
        String name,
        String code

) {
}
