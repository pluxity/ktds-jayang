package com.pluxity.ktds.domains.user.dto;

import com.pluxity.ktds.domains.user.constant.MenuType;

import java.util.List;
import java.util.Set;

public record UpdateUserGroupPermissionDTO(
        List<UserGroupBuildingPermissionDTO> buildingPermissions,
        List<UserGroupCategoryPermissionDTO> categoryPermissions,
        List<MenuType> menuPermissions
) {
}
