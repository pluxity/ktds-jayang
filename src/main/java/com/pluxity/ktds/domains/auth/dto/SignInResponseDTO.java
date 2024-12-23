package com.pluxity.ktds.domains.auth.dto;

import lombok.Builder;

@Builder
public record SignInResponseDTO(
    String accessToken,
    String refreshToken,
    String username,
    String name
) {

}
