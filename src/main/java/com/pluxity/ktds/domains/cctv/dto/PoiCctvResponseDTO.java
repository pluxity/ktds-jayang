package com.pluxity.ktds.domains.cctv.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PoiCctvResponseDTO {
    private Long cctvPoiId;
    private Long poiId;

    public PoiCctvResponseDTO(Long cctvPoiId, Long poiId) {
        this.cctvPoiId = cctvPoiId;
        this.poiId = poiId;
    }
}
