package com.pluxity.ktds.domains.auth.service;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDto;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDto;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDto;
import com.pluxity.ktds.domains.auth.entity.RefreshToken;
import com.pluxity.ktds.domains.auth.repository.RefreshTokenRepository;
import com.pluxity.ktds.domains.user.constant.Role;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.security.CustomUserDetails;
import com.pluxity.ktds.global.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;

import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshExpiration;

    @Transactional
    public void signUpAdmin(final SignUpRequestDto signUpRequestDto) {

        var fetch = userRepository.findByUserId(signUpRequestDto.userId());
        if (fetch.isEmpty()) {
            var user =
                    User.builder()
                            .userId(signUpRequestDto.userId())
                            .password(passwordEncoder.encode(signUpRequestDto.password()))
                            .name(signUpRequestDto.name())
                            .role(Role.ADMIN)
                            .build();

            userRepository.save(user);
        }
    }

    @Transactional
    public User signUp(final SignUpRequestDto signUpRequestDto) {

        var userId = signUpRequestDto.userId();
        userRepository
                .findByUserId(userId)
                .ifPresent(
                        user -> {
                            throw new CustomException(DUPLICATE_USERID);
                        });


        // TODO CODE 정규식 검사 필요?

        var user =
                User.builder()
                        .userId(signUpRequestDto.userId())
                        .password(passwordEncoder.encode(signUpRequestDto.password()))
                        .name(signUpRequestDto.name())
                        .build();

        return userRepository.save(user);
    }

    @Transactional
    public SignInResponseDto signIn(final SignInRequestDto signInRequestDto) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            signInRequestDto.userId(), signInRequestDto.password()));
        } catch (AuthenticationException e) {
            log.error("Invalid Id or Password : {}", e.getMessage());
            throw new CustomException(INVALID_ID_OR_PASSWORD);
        }

        User user =
                userRepository
                        .findByUserId(signInRequestDto.userId())
                        .orElseThrow(() -> new CustomException(NOT_FOUND_USER));

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String jwtToken = jwtProvider.generateAccessToken(userDetails);
        String refreshToken = jwtProvider.generateRefreshToken(userDetails);

        refreshTokenRepository.save(RefreshToken.of(user.getUserId(), refreshToken, refreshExpiration));

        return SignInResponseDto.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(user.getRole())
                .name(user.getName())
                .build();
    }

    public SignInResponseDto refreshToken(HttpServletRequest request) {

        String refreshToken = jwtProvider.getJwtFromRequest(request);

        String accessToken;
        String newRefreshToken;

        if (!jwtProvider.isRefreshTokenValid(refreshToken)) {
            log.error("Refresh Token Error :{}", refreshToken);
            throw new CustomException(INVALID_REFRESH_TOKEN);
        }

        String userId = jwtProvider.extractUsername(refreshToken, true);

        CustomUserDetails userDetails =
                userRepository
                        .findByUserId(userId)
                        .map(CustomUserDetails::new)
                        .orElseThrow(() -> new CustomException(NOT_FOUND_USER));

        User user = userDetails.getUser();

        accessToken = jwtProvider.generateAccessToken(userDetails);
        newRefreshToken = jwtProvider.generateRefreshToken(userDetails);

        refreshTokenRepository.save(RefreshToken.of(userId, newRefreshToken, refreshExpiration));

        return SignInResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .role(user.getRole())
                .name(user.getName())
                .build();
    }
}
