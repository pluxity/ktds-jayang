package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record UpdatePoiDTO(

        @NotNull(message = "코드는 필수 입니다.")
        @NotBlank(message = "코드는 필수 입니다.")
        @Size(min = 1, max = 20, message = "코드는 20자 이하 입니다.")
        String code,

        @NotNull(message = "이름은 필수 입니다.")
        @NotBlank(message = "이름은 필수 입니다.")
        @Size(min = 1, max = 50, message = "이름은 50자 이하 입니다.")
        String name,

        @NotNull(message = "도면 아이디는 필수 입니다.")
        @Digits(integer = 20, fraction = 0, message = "빌딩 아이디는 20자리 이하의 숫자 입니다.")
        Long buildingId,
        @NotNull(message = "층 아이디는 필수 입니다.")
        @Digits(integer = 20, fraction = 0, message = "층 아이디는 20자리 이하의 숫자 입니다.")
        Long floorId,
        @NotNull(message = "카테고리 아이디는 필수 입니다.")
        @Digits(integer = 20, fraction = 0, message = "카테고리 아이디는 20자리 이하의 숫자 입니다.")
        Long poiCategoryId,
        @NotNull(message = "카테고리 아이디는 필수 입니다.")
        @Digits(integer = 20, fraction = 0, message = "카테고리 아이디는 20자리 이하의 숫자 입니다.")
        Long poiMiddleCategoryId,
        @NotNull(message = "아이콘셋 아이디는 필수 입니다.")
        @Digits(integer = 20, fraction = 0, message = "아이콘셋 아이디는 20자리 이하의 숫자 입니다.")
        Long iconSetId,
        List<String> tagNames,
        List<PoiCctvDTO> cctvList,
        Boolean isLight,
        String lightGroup

) {
}
