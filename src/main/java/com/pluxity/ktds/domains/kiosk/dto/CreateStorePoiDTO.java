package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.kiosk.entity.KioskCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateStorePoiDTO(
        boolean isKiosk,
        @NotNull(message = "name은 필수 입니다.")
        @NotBlank(message = "name은 공백이 될 수 없습니다.")
        String name,
        @NotNull(message = "업종은 필수 입니다.")
        KioskCategory category,
        @NotNull(message = "빌딩은 필수 입니다.")
        Long buildingId,
        @NotNull(message = "층은 필수 입니다.")
        Integer floorNo,
        String phoneNumber,
        Long fileInfoId,
        List<CreateBannerDTO> banners
) {
}
