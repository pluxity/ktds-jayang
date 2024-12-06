package com.pluxity.ktds.domains.user.controller;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

import com.pluxity.ktds.domains.user.dto.ChangePasswordDto;
import com.pluxity.ktds.domains.user.dto.PatchDto;
import com.pluxity.ktds.domains.user.dto.ResponseDto;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService service;

  @GetMapping
  public DataResponseBody<List<ResponseDto>> getUsers() {
    return DataResponseBody.of(service.findAll());
  }

  @GetMapping(value = "/{id}", produces = "application/json")
  public DataResponseBody<ResponseDto> getUser(@PathVariable("id") Long id) {
    return DataResponseBody.of(service.findById(id));
  }

  @PatchMapping(value = "/{id}", produces = "application/json")
  public ResponseBody patchUserInfo(@PathVariable("id") Long id, @RequestBody PatchDto dto) {
    service.patch(id, dto);
    return ResponseBody.of(SUCCESS_PATCH);
  }

  @PatchMapping(value = "/{id}/change-password", produces = "application/json")
  public ResponseBody changePassword(
      @PathVariable("id") Long id, @RequestBody ChangePasswordDto dto) {
    service.changePassword(id, dto);
    return ResponseBody.of(SUCCESS_PATCH);
  }

  @DeleteMapping(value = "/{id}", produces = "application/json")
  public ResponseBody deleteUser(@PathVariable("id") Long id) {
    service.delete(id);
    return ResponseBody.of(SUCCESS_DELETE);
  }
}
