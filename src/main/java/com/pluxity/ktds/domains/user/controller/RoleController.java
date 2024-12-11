package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.RoleRequestDto;
import com.pluxity.ktds.domains.user.dto.RoleResponseDto;
import com.pluxity.ktds.domains.user.service.RoleService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @GetMapping("/roles")
    public DataResponseBody<List<RoleResponseDto>> getRoles() {
        return DataResponseBody.of(roleService.findAll());
    }

    @GetMapping("/roles/{id}")
    public DataResponseBody<RoleResponseDto> getRole(@PathVariable Long id) {
        return DataResponseBody.of(roleService.findById(id));
    }

    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<RoleResponseDto> postRole(@RequestBody RoleRequestDto dto) {
        return DataResponseBody.of(roleService.save(dto));
    }

    @PatchMapping("/roles/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchRole(@PathVariable Long id,
                                     @RequestBody RoleRequestDto dto) {
        roleService.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/roles/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteRole(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
