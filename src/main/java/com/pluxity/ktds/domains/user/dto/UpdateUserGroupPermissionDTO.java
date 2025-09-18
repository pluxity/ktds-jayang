package com.pluxity.ktds.domains.user.dto;

import java.util.List;
import java.util.Set;

public record UpdateUserGroupPermissionDTO(
        List<UserGroupBuildingPermissionDTO> buildingPermissions,
        List<UserGroupCategoryPermissionDTO> categoryPermissions
) {
}
