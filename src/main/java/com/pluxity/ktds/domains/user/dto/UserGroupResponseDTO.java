package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

import java.util.Set;

@Builder
public record UserGroupResponseDTO(
        Long id,
        String name,
        String groupType,
        String description,
        Set<UserGroupBuildingPermissionDTO> buildingPermissions,
        Set<UserGroupCategoryPermissionDTO> categoryPermissions
) {
}
