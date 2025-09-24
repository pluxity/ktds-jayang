package com.pluxity.ktds.domains.user.dto;

import java.util.Set;

public record UpdateUserGroupDTO(
        String name,
        String groupType,
        String description
) {
}
