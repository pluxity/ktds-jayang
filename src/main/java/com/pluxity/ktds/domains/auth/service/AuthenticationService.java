package com.pluxity.ktds.domains.auth.service;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpDTO;
import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.security.CustomUserDetails;
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

  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

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

    return SignInResponseDTO.builder()
        .username(user.getUsername())
        .name(user.getName())
        .build();
  }
}
