package com.pluxity.ktds.domains.kiosk.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record UpdateBannerDTO(
   Long id,
   Long fileId,
   int priority,
   LocalDate startDate,
   LocalDate endDate,
   boolean isPermanent
) {}
