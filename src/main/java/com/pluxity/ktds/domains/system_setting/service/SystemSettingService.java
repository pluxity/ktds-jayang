package com.pluxity.ktds.domains.system_setting.service;

import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingResponseDTO;
import com.pluxity.ktds.domains.system_setting.entity.SystemSetting;
import com.pluxity.ktds.domains.system_setting.repository.SystemSettingRepository;
import com.pluxity.ktds.global.exception.CustomException;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_SYSTEM_SETTING;


@RequiredArgsConstructor
@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final BuildingRepository buildingRepository;

    @Transactional(readOnly = true)
    public List<SystemSettingResponseDTO> getSystemSetting() {
        List<SystemSetting> systemSettingList = systemSettingRepository.findAll();
        if (systemSettingList.isEmpty()) {
            return buildingRepository.findAll().stream()
                    .map(b -> SystemSettingResponseDTO.builder()
                            .buildingId(b.getId())
                            .poiLineLength(30F)
                            .poiIconSizeRatio(210F)
                            .poiTextSizeRatio(100F)
                            .nodeDefaultColor("#FFFFFF")
                            .build())
                    .toList();
        } else {
            return systemSettingList.stream()
                    .map(SystemSetting::toDto)
                    .toList();
        }
    }

    @Transactional
    public SystemSettingResponseDTO getSystemSettingByBuildingId(Long buildingId) {
        SystemSetting systemSetting = systemSettingRepository.findByBuildingId(buildingId)
                .orElseThrow(() -> new CustomException(NOT_FOUND_SYSTEM_SETTING));

        return systemSetting.toDto();
    }

    @Transactional
    public List<SystemSettingResponseDTO> updateSystemSetting(List<SystemSettingRequestDTO> requests) {

        List<SystemSettingResponseDTO> results = new ArrayList<>();

        for (SystemSettingRequestDTO req : requests) {
            SystemSetting setting = systemSettingRepository.findByBuildingId(req.buildingId())
                    .orElseGet(() -> SystemSetting.builder()
                            .building(buildingRepository.getReferenceById(req.buildingId()))
                            .build());

            setting.update(
                    req.poiLineLength(),
                    req.poiIconSizeRatio(),
                    req.poiTextSizeRatio(),
                    req.nodeDefaultColor()
            );

            results.add(systemSettingRepository.save(setting).toDto());
        }

        return results;
    }

    @Transactional
    public void deleteSystemSetting(Long id) {

        SystemSetting systemSetting = systemSettingRepository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_SYSTEM_SETTING));

        systemSettingRepository.delete(systemSetting);
    }
}

