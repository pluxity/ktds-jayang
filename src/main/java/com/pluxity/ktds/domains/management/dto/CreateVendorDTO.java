package com.pluxity.ktds.domains.management.dto;

public record CreateVendorDTO(
        String vendorName,
        String representativeName,
        String businessNumber,
        String contactNumber,
        String description,
        String modifier
) {
}
