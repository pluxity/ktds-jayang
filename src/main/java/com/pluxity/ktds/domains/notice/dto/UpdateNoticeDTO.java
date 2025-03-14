package com.pluxity.ktds.domains.notice.dto;

import com.pluxity.ktds.domains.notice.entity.Notice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Valid
public record UpdateNoticeDTO(
        @NotNull(message = "제목은 필수 입니다.")
        @NotBlank(message = "제목은 공백이 될 수 없습니다.")
        @Size(min = 1, max = 20, message = "제목은 20자 이하 입니다.")
        String title,
        @NotNull(message = "본문은 필수 입니다.")
        @NotBlank(message = "본문은 공백이 될 수 없습니다.")
        String content,
        @NotNull(message = "긴급 여부는 필수 입니다.")
        Boolean isUrgent,
        Boolean isActive,
        Boolean isRead,
        @NotNull(message = "종료 날짜는 필수 입니다.")
        LocalDateTime expiredAt,
        List<Long> buildingIds
) {

    public static Notice toEntity(UpdateNoticeDTO dto) {
        return new Notice(
                dto.title(),
                dto.content(),
                dto.isUrgent(),
                dto.isActive(),
                dto.isRead(),
                dto.expiredAt(),
                dto.buildingIds()
        );
    }
}
