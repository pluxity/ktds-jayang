package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record BannerDetailResponseDTO(
        Long id,
        Long image,
        FileInfoDTO bannerFile,
        LocalDate startDate,
        LocalDate endDate,
        int priority,
        boolean isPermanent
) {
}
