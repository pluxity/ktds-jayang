package com.pluxity.ktds.domains.user.dto;

import com.pluxity.ktds.domains.user.entity.UserAuthority;

public record UserAuthorityResponseDTO(
        String name
) {
    public static UserAuthorityResponseDTO from(UserAuthority authority) {
        return new UserAuthorityResponseDTO(authority.getName());
    }
}
