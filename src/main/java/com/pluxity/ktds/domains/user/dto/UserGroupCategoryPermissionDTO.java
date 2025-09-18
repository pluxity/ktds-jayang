package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

@Builder
public record UserGroupCategoryPermissionDTO(
        Long poiCategoryId,
        Boolean canRead,
        Boolean canWrite,
        String registeredBy
) {
}
