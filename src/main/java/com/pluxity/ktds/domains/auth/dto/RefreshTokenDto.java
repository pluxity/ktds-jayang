package com.pluxity.ktds.domains.auth.dto;

import lombok.Builder;

@Builder
public record RefreshTokenDto(String accessToken, String refreshToken) {}
