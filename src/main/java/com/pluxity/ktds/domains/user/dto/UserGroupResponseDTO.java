package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

@Builder
public record UserGroupResponseDTO(
        Long id,
        String name
) {
}
