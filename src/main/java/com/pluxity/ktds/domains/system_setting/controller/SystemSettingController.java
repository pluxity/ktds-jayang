package com.pluxity.ktds.domains.system_setting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingResponseDTO;
import com.pluxity.ktds.domains.system_setting.service.SystemSettingService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/system-settings")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping()
    public DataResponseBody<List<SystemSettingResponseDTO>> getSystemSettings() {
        return DataResponseBody.of(systemSettingService.getSystemSetting());
    }

    @GetMapping("/{buildingId}")
    public DataResponseBody<SystemSettingResponseDTO> getSystemSettingByBuildingId(@PathVariable Long buildingId) {
        return DataResponseBody.of(systemSettingService.getSystemSettingByBuildingId(buildingId));
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.ACCEPTED)
    public DataResponseBody<List<SystemSettingResponseDTO>> postSystemSettings(@RequestBody List<SystemSettingRequestDTO> requestDtos) {
        return DataResponseBody.of(systemSettingService.updateSystemSetting(requestDtos));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteEvaluationArea(@PathVariable Long id) {
        systemSettingService.deleteSystemSetting(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}
