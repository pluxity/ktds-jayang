package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

@Builder
public record UserGroupResponseDto(
        Long id,
        String name
) {
}
