package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.kiosk.entity.KioskCategory;
import lombok.Builder;


@Builder
public record StorePoiBasicResponseDTO (
        KioskCategory category,
        String floorNm,
        String phoneNumber,
        Long logo,
        FileInfoDTO logoFile
) {}
