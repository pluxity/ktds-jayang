package com.pluxity.ktds.domains.kiosk.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record BannerDetailResponseDTO(
        Long id,
        Long image,
        LocalDate startDate,
        LocalDate endDate,
        int priority
) {
}
