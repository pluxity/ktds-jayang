package com.pluxity.ktds.domains.auth.controller;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpDTO;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

  private final AuthenticationService authenticationService;

  @PostMapping(value = "/sign-up")
  public ResponseBody signUp(@RequestBody SignUpDTO signUpRequestDto) {
    authenticationService.signUp(signUpRequestDto);
    return ResponseBody.of(SUCCESS_CREATE);
  }

  @PostMapping(value = "/sign-in")
  public DataResponseBody<SignInResponseDTO> signIn(
      @RequestBody SignInRequestDTO signInRequestDto) {
    return DataResponseBody.of(authenticationService.signIn(signInRequestDto));
  }

  @PostMapping(value = "/refresh-token")
  public DataResponseBody<SignInResponseDTO> refreshToken(HttpServletRequest request) {
    return DataResponseBody.of(authenticationService.refreshToken(request));
  }
}
