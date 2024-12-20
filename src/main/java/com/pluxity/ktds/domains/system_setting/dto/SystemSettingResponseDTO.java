package com.pluxity.ktds.domains.system_setting.dto;

import lombok.Builder;

@Builder
public record SystemSettingResponseDTO(
        Long id,
        float poiLineLength,
        float poiIconSizeRatio,
        float poiTextSizeRatio,
        String nodeDefaultColor
) {}
