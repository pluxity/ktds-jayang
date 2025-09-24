package com.pluxity.ktds.domains.auth.controller;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpDTO;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

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
          @RequestBody SignInRequestDTO signInRequestDto, HttpServletRequest request, HttpServletResponse response) {
    return DataResponseBody.of(authenticationService.signIn(signInRequestDto, request, response));
  }
}
