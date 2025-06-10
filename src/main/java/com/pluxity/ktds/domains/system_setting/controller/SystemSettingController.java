package com.pluxity.ktds.domains.system_setting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingResponseDTO;
import com.pluxity.ktds.domains.system_setting.service.SystemSettingService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/system-settings")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping()
    public DataResponseBody<SystemSettingResponseDTO> getSystemSettings() {
        return DataResponseBody.of(systemSettingService.getSystemSetting());
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.ACCEPTED)
    public DataResponseBody<SystemSettingResponseDTO> postSystemSettings(@RequestBody SystemSettingRequestDTO requestDto) {
        return DataResponseBody.of(systemSettingService.updateSystemSetting(requestDto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteEvaluationArea(@PathVariable Long id) {
        systemSettingService.deleteSystemSetting(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}
