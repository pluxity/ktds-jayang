package com.pluxity.ktds.domains.auth.dto;

import com.pluxity.ktds.domains.user.constant.Role;
import lombok.Builder;

@Builder
public record SignInResponseDto(
    String accessToken, String refreshToken, Role role, String name) {}
