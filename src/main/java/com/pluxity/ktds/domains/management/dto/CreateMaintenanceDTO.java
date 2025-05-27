package com.pluxity.ktds.domains.management.dto;

import com.pluxity.ktds.domains.management.constant.ManagementCategory;
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
