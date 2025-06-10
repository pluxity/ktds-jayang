package com.pluxity.ktds.domains.management.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record VendorResponseDTO(
        Long id,
        String vendorName,
        String representativeName,
        String businessNumber,
        String contactNumber,
        String description,
        String modifier,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt
) {
}
