package com.pluxity.ktds.domains.cctv.dto;

import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import lombok.Builder;

@Builder
public record PoiCctvDTO(
        Long id,
        String cctvName,
        String isMain
) {
    public static PoiCctvDTO from(PoiCctv poiCctv) {
        return PoiCctvDTO.builder()
                .id(poiCctv.getId())
                .cctvName(poiCctv.getCctvName())
                .isMain(poiCctv.getIsMain())
                .build();
    }
}
