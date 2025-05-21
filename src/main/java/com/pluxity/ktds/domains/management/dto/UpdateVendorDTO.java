package com.pluxity.ktds.domains.management.dto;

import lombok.Builder;

@Builder
public record UpdateVendorDTO(
        String vendorName,
        String representativeName,
        String businessNumber,
        String contactNumber,
        String description,
        String modifier
) {

}
