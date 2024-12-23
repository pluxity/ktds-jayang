package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.CreateAuthorityDTO;
import com.pluxity.ktds.domains.user.dto.UserAuthorityResponseDTO;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.service.UserAuthorityService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-authorities")
public class UserAuthorityController {

    private final UserAuthorityService service;

    @GetMapping
    public DataResponseBody<List<UserAuthorityResponseDTO>> getUserAuthorities() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping(value = "/{id}")
    public DataResponseBody<UserAuthorityResponseDTO> getUserAuthority(@PathVariable("id") Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping
    public ResponseBody postUserAuthority(@RequestBody CreateAuthorityDTO dto) {
        service.save(dto);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseBody deleteUserAuthority(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}
