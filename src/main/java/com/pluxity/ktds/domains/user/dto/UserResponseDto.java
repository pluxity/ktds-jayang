package com.pluxity.ktds.domains.user.dto;

import lombok.Builder;

import java.util.Set;

@Builder
public record UserResponseDto(
        Long id,
        String username,
        String nickname,
        Set<String> roles
) {
}
