package com.pluxity.ktds.domains.system_setting.dto;

import lombok.Builder;
import com.pluxity.ktds.domains.system_setting.entity.SystemSetting;

@Builder(toBuilder = true)
public record SystemSettingRequestDTO(
        Long buildingId,
        float poiLineLength,
        float poiIconSizeRatio,
        float poiTextSizeRatio,
        String nodeDefaultColor
) {
    public SystemSetting toEntity() {
        return SystemSetting.builder()
                .nodeDefaultColor(nodeDefaultColor)
                .poiIconSizeRatio(poiIconSizeRatio)
                .poiTextSizeRatio(poiTextSizeRatio)
                .poiLineLength(poiLineLength)
                .build();
    }

}
