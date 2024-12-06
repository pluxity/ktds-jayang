package com.pluxity.ktds.domains.auth.controller;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDto;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDto;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDto;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

  private final AuthenticationService authenticationService;

  @PostMapping(value = "/sign-up")
  public ResponseBody signUp(@RequestBody SignUpRequestDto signUpRequestDto) {
    authenticationService.signUp(signUpRequestDto);
    return ResponseBody.of(SUCCESS_CREATE);
  }

  @PostMapping(value = "/sign-in", produces = "application/json")
  public DataResponseBody<SignInResponseDto> signIn(
      @RequestBody SignInRequestDto signInRequestDto) {
    return DataResponseBody.of(authenticationService.signIn(signInRequestDto));
  }

  @PostMapping(value = "/refresh-token")
  public DataResponseBody<SignInResponseDto> refreshToken(HttpServletRequest request) {
    return DataResponseBody.of(authenticationService.refreshToken(request));
  }
}
