package com.pluxity.ktds.domains.auth.service;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpDTO;
import com.pluxity.ktds.domains.auth.entity.RefreshToken;
import com.pluxity.ktds.domains.auth.repository.RefreshTokenRepository;
import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.security.CustomUserDetails;
import com.pluxity.ktds.global.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

  private final UserService userService;

  private final RefreshTokenRepository refreshTokenRepository;

  private final JwtProvider jwtProvider;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

  @Value("${jwt.refresh-token.expiration}")
  private long refreshExpiration;

  @Transactional
  public void signUp(final SignUpDTO signUpRequestDto) {
    boolean isExist = userService.isUserExists(signUpRequestDto.username());
    if(isExist) {
      throw new CustomException(DUPLICATE_NAME);
    }

    CreateUserDTO createUserDTO = CreateUserDTO.builder()
            .username(signUpRequestDto.username())
            .password(passwordEncoder.encode(signUpRequestDto.password()))
            .name(signUpRequestDto.name())
            .build();

    userService.save(createUserDTO);
  }

  @Transactional
  public SignInResponseDTO signIn(final SignInRequestDTO signInRequestDto) {

    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              signInRequestDto.username(), signInRequestDto.password()));
    } catch (AuthenticationException e) {
      log.error("Invalid Username or Password : {}", e.getMessage());
      throw new CustomException(INVALID_ID_OR_PASSWORD);
    }

    var user = userService.findUserByUsername(signInRequestDto.username());
    CustomUserDetails userDetails = new CustomUserDetails(user);

    String jwtToken = jwtProvider.generateAccessToken(userDetails);
    String refreshToken = jwtProvider.generateRefreshToken(userDetails);

    refreshTokenRepository.save(RefreshToken.of(user.getUsername(), refreshToken, refreshExpiration));

    return SignInResponseDTO.builder()
        .accessToken(jwtToken)
        .refreshToken(refreshToken)
        .username(user.getUsername())
        .name(user.getName())
        .build();
  }

  public SignInResponseDTO refreshToken(HttpServletRequest request) {

    String refreshToken = jwtProvider.getJwtFromRequest(request);

    String accessToken;
    String newRefreshToken;

    if (!jwtProvider.isRefreshTokenValid(refreshToken)) {
        log.error("Refresh Token Error :{}", refreshToken);
      throw new CustomException(INVALID_REFRESH_TOKEN);
    }

    String username = jwtProvider.extractUsername(refreshToken, true);

    var user = userService.findUserByUsername(username);
    CustomUserDetails userDetails = new CustomUserDetails(user);

    accessToken = jwtProvider.generateAccessToken(userDetails);
    newRefreshToken = jwtProvider.generateRefreshToken(userDetails);

    refreshTokenRepository.save(RefreshToken.of(username, newRefreshToken, refreshExpiration));

    return SignInResponseDTO.builder()
        .accessToken(accessToken)
        .refreshToken(newRefreshToken)
        .username(user.getUsername())
        .name(user.getName())
        .build();
  }
}
