package com.pluxity.ktds.domains.kiosk.dto;

import lombok.Builder;

@Builder
public record KioskAllPoiResponseDTO(
        Long id,
        String name,
        boolean isKiosk
) {}
