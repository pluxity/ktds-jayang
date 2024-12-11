package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.UserGroupRequestDto;
import com.pluxity.ktds.domains.user.dto.UserGroupResponseDto;
import com.pluxity.ktds.domains.user.service.UserGroupService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
public class UserGroupController {

    private final UserGroupService service;

    @GetMapping("/user-groups")
    public DataResponseBody<List<UserGroupResponseDto>> getUserGroups() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/user-groups/{id}")
    public DataResponseBody<UserGroupResponseDto> getUserGroup(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping("/user-groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postUserGroup(@RequestBody UserGroupRequestDto dto) {
        service.save(dto);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @PatchMapping("/user-groups/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchUserGroup(@PathVariable Long id,
                                               @RequestBody UserGroupRequestDto dto) {
        service.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/user-groups/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteUserGroup(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
