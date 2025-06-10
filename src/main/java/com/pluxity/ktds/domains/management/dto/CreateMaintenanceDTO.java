package com.pluxity.ktds.domains.management.dto;

import lombok.Builder;

@Builder
public record CreateMaintenanceDTO(
        Long id,
        String managementCategory,
        String maintenanceName,
        String mainManagerDivision,
        String mainManagerName,
        String mainManagerContact,
        String subManagerDivision,
        String subManagerName,
        String subManagerContact,
        String modifier
) {
}
