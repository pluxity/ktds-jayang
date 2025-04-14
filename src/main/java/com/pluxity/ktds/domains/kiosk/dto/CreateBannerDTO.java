package com.pluxity.ktds.domains.kiosk.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record CreateBannerDTO(
        Long fileId,
        int priority,
        LocalDate startDate,
        LocalDate endDate,
        boolean always
) {
}
