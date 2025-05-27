package com.pluxity.ktds.domains.management.controller;

import com.pluxity.ktds.domains.management.dto.*;
import com.pluxity.ktds.domains.management.service.MaintenanceService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postMaintenance(
            @RequestBody CreateMaintenanceDTO maintenanceDTO) {
        maintenanceService.save(maintenanceDTO);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @GetMapping
    public DataResponseBody<List<MaintenanceResponseDTO>> getAllMaintenances() {
        List<MaintenanceResponseDTO> maintenances = maintenanceService.findAll();
        return DataResponseBody.of(maintenances);
    }

    @GetMapping("/{id}")
    public DataResponseBody<MaintenanceResponseDTO> getMaintenance(@PathVariable Long id) {
        return DataResponseBody.of(maintenanceService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseBody updateMaintenance(
            @PathVariable Long id,
            @RequestBody UpdateMaintenanceDTO updateMaintenanceDTO) {
        maintenanceService.updateMaintenance(id, updateMaintenanceDTO);
        return ResponseBody.of(SUCCESS_PUT);
    }
    @DeleteMapping("/{id}")
    public ResponseBody deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping("/id-list/{ids}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteMaintenanceList(@PathVariable List<Long> ids) {
        maintenanceService.deleteMaintenanceAllById(ids);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
