package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import lombok.Builder;

import java.util.List;

@Builder
public record PoiAlarmDetailDTO(
        Long id,
        Long buildingId,
        Integer floorNo,
        Long poiCategoryId,
        Long poiMiddleCategoryId,
        Long iconSetId,
        Spatial position,
        Spatial rotation,
        Spatial scale,
        String name,
        String code,
        List<String> tagNames,
        List<PoiCctvDTO> cctvList,
        Boolean isLight,
        String lightGroup,
        String cameraIp,
        String cameraId,
        SopResponseDTO sop  // 새로 추가
) { }
