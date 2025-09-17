package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import lombok.Builder;

import java.util.List;

@Builder
public record PoiPagingResponseDTO(
        Long id,
        String name,
        String code,
        Long buildingId,
        Integer floorNo,
        Long poiCategoryId,
        String poiCategoryName,
        Long poiMiddleCategoryId,
        String poiMiddleCategoryName,
        Long iconSetId,
        Spatial position,
        Spatial rotation,
        Spatial scale,
        List<String> tagNames,
        List<PoiCctvDTO> cctvList,
        Boolean isLight,
        String lightGroup,
        String cameraIp,
        String cameraId
) {
}