package com.pluxity.ktds.security.service;

import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Value("${jwt.access-token.expiration}")
    public int ACCESS_TOKEN_EXPIRE_AT;
    private final UserRepository userRepository;


    private static void authenticateUser(HttpServletRequest request, UserDetails userDetails) {

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    @Override
    protected void doFilterInternal(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final FilterChain filterChain
    ) throws ServletException, IOException {

        extractCookies(request).ifPresent(cookies -> {
            Optional<String> accessToken = cookies.getAccessToken();
            Optional<String> refreshToken = cookies.getRefreshToken();

            accessToken.ifPresentOrElse(
                    access -> processAccessToken(request, access),
                    () -> refreshToken.ifPresent(refresh -> processRefreshToken(request, response, refresh))
            );
        });

        filterChain.doFilter(request, response);
    }


    private void processAccessToken(HttpServletRequest request, String accessToken) {
        try {
            String username = jwtService.extractUsername(accessToken);
            userRepository.findByUsername(username).ifPresent(user -> {
                if (SecurityContextHolder.getContext().getAuthentication() == null
                        && jwtService.isAccessTokenValid(accessToken, user)) {
                    authenticateUser(request, user);
                }
            });
        } catch (ExpiredJwtException e) {
            // 아무것도 하지 않는다.
        } catch (MalformedJwtException e) {
            throw new CustomException(ErrorCode.INVALID_JWT_TOKEN);
        }
    }

    private void processRefreshToken(HttpServletRequest request, HttpServletResponse response, String refreshToken) {
        try {
            String username = jwtService.extractUsername(refreshToken);
            userRepository.findByUsername(username).ifPresent(user -> {
                if (SecurityContextHolder.getContext().getAuthentication() == null
                        && jwtService.isRefreshTokenValid(refreshToken, user)) {
                    authenticateUser(request, user);
                    generateNewAccessToken(request, response, user);
                }
            });
        } catch (ExpiredJwtException | MalformedJwtException e) {
            throw new CustomException(ErrorCode.INVALID_JWT_TOKEN);
        }
    }

    private Optional<CookiePair> extractCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            String accessToken = null;
            String refreshToken = null;

            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("AccessToken")) {
                    accessToken = cookie.getValue();
                } else if (cookie.getName().equals("RefreshToken")) {
                    refreshToken = cookie.getValue();
                }
            }

            if (accessToken != null || refreshToken != null) {
                return Optional.of(CookiePair.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build());
            }
        }

        return Optional.empty();
    }


    private static class CookiePair {
        private final String accessToken;
        private final String refreshToken;

        @Builder
        public CookiePair(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public Optional<String> getAccessToken() {
            return Optional.ofNullable(accessToken);
        }

        public Optional<String> getRefreshToken() {
            return Optional.ofNullable(refreshToken);
        }
    }


    private void generateNewAccessToken(HttpServletRequest request, HttpServletResponse response, UserDetails userDetails) {
        String newAccessToken = jwtService.generateAccessToken(userDetails);

        Cookie cookie = new Cookie("AccessToken", newAccessToken);
        cookie.setMaxAge(ACCESS_TOKEN_EXPIRE_AT / 1000);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        response.addCookie(cookie);

        authenticateUser(request, userDetails);
    }
}
