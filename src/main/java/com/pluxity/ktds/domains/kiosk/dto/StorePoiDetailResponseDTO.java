package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.kiosk.entity.KioskCategory;
import lombok.Builder;

import java.util.List;

@Builder
public record StorePoiDetailResponseDTO (
    Long id,
    boolean isKiosk,
    String name,
    KioskCategory category,
    Long buildingId,
    Long floorId,
    String phoneNumber,
    Long logo,
    List<BannerDetailResponseDTO> banners,
    Spatial position,
    Spatial rotation,
    Spatial scale
){}
