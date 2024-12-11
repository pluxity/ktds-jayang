package com.pluxity.ktds.domains.system_setting.service;

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
import java.util.List;

import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_SYSTEM_SETTING;


@RequiredArgsConstructor
@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public SystemSettingResponseDTO getSystemSetting() {
        List<SystemSetting> systemSettingList = systemSettingRepository.findAll();
        if (systemSettingList.isEmpty()) {
            return SystemSetting.builder().build().toDto();
        } else {
            return systemSettingList.get(0).toDto();
        }
    }

    @Transactional
    public SystemSettingResponseDTO updateSystemSetting(SystemSettingRequestDTO requestDto) {

        List<SystemSetting> systemSettingList = systemSettingRepository.findAll();
        if(systemSettingList.isEmpty()) {
            SystemSetting systemSetting = SystemSetting.builder()
                    .poiIconSizeRatio(requestDto.poiIconSizeRatio())
                    .poiLineLength(requestDto.poiLineLength())
                    .poiTextSizeRatio(requestDto.poiTextSizeRatio())
                    .nodeDefaultColor(requestDto.nodeDefaultColor())
                    .build();
            return systemSettingRepository.save(systemSetting).toDto();
        } else {
            SystemSetting systemSetting = systemSettingRepository.findById(systemSettingList.get(0).getId()).orElseThrow(() -> new CustomException(NOT_FOUND_SYSTEM_SETTING));
             systemSetting.update(requestDto.poiLineLength(), requestDto.poiIconSizeRatio(), requestDto.poiTextSizeRatio(), requestDto.nodeDefaultColor());
            return systemSetting.toDto();
        }
    }

    @Transactional
    public void deleteSystemSetting(Long id) {

        SystemSetting systemSetting = systemSettingRepository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_SYSTEM_SETTING));

        systemSettingRepository.delete(systemSetting);
    }
}

