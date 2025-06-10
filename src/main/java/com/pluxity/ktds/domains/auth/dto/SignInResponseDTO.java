package com.pluxity.ktds.domains.auth.dto;

import lombok.Builder;

@Builder
public record SignInResponseDTO(
    String username,
    String name
) {

}
