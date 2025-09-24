package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

import java.util.Set;

@Builder
public record UserResponseDTO(
        Long id,
        String username,
        String groupName,
        Set<UserAuthorityResponseDTO> authorities,
        Set<UserGroupBuildingPermissionDTO> buildingPermissions,
        Set<UserGroupCategoryPermissionDTO> categoryPermissions,
        String name
) {}
