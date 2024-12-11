package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

@Builder
public record RoleResponseDto(
        Long id,
        String name
) {
}
