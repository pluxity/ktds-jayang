package com.pluxity.ktds.domains.user.dto;

import com.pluxity.ktds.domains.user.constant.MenuType;
import lombok.Builder;

import java.util.Set;

@Builder
public record UserGroupResponseDTO(
        Long id,
        String name,
        String groupType,
        String description,
        Set<UserGroupBuildingPermissionDTO> buildingPermissions,
        Set<UserGroupCategoryPermissionDTO> categoryPermissions,
        Set<MenuType> menuPermissions
) {
}
