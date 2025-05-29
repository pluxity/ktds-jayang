package com.pluxity.ktds.domains.kiosk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdateKioskPoiDTO(
        Long id,
        @NotNull(message = "name은 필수 입니다.")
        @NotBlank(message = "name은 공백이 될 수 없습니다.")
        String name,
        @NotNull(message = "code는 필수 입니다.")
        @NotBlank(message = "code는 공백이 될 수 없습니다.")
        String kioskCode,
        @NotNull(message = "빌딩은 필수 입니다.")
        Long buildingId,
        @NotNull(message = "층은 필수 입니다.")
        Integer floorNo,
        String description
) {
}
