package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
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
    String floorNm,
    String phoneNumber,
    Long logo,
    FileInfoDTO logoFile,
    List<BannerDetailResponseDTO> banners,
    Spatial position,
    Spatial rotation,
    Spatial scale
){}
