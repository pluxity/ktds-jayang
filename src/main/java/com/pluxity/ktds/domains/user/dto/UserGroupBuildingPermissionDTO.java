package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

@Builder
public record UserGroupBuildingPermissionDTO(
        Long buildingId,
        Boolean canRead,
        Boolean canWrite,
        String registeredBy
) {
}
