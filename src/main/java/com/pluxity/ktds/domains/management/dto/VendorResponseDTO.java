package com.pluxity.ktds.domains.management.dto;

import lombok.Builder;

@Builder
public record VendorResponseDTO(
        Long id,
        String vendorName,
        String representativeName,
        String businessNumber,
        String contactNumber,
        String description,
        String modifier,
        String createdAt,
        String modifiedAt
) {
}
