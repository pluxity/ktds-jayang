package com.pluxity.ktds.security.config;

import com.pluxity.ktds.security.repository.RefreshTokenRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ClearRefreshTokens {
    private final RefreshTokenRepository refreshTokenRepository;

    @PostConstruct
    public void clearTokens() {
        refreshTokenRepository.deleteAll();
    }

}
