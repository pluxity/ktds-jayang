package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.ResponseDto;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserSelfController {

  private final UserService service;

  @GetMapping(value = "/users/my-info", produces = "application/json")
  public DataResponseBody<ResponseDto> getMyInfo(Principal principal) {
    return DataResponseBody.of(service.myInfo(principal));
  }
}
