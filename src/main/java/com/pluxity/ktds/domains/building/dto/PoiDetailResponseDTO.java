package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import lombok.Builder;

import java.util.List;

@Builder
public record PoiDetailResponseDTO(
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
        String cameraId
) {
    public PoiDetailResponseDTO withRelations(List<String> tagNames, List<PoiCctvDTO> cctvList) {
        return new PoiDetailResponseDTO(
                this.id,
                this.buildingId,
                this.floorNo,
                this.poiCategoryId,
                this.poiMiddleCategoryId,
                this.iconSetId,
                this.position,
                this.rotation,
                this.scale,
                this.name,
                this.code,
                tagNames,
                cctvList,
                this.isLight,
                this.lightGroup,
                this.cameraIp,
                this.cameraId
        );
    }
}
