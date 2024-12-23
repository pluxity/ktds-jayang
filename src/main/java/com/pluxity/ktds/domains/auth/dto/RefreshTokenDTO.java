package com.pluxity.ktds.domains.auth.dto;

import lombok.Builder;

@Builder
public record RefreshTokenDTO(String accessToken, String refreshToken) {}
