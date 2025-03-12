package com.pluxity.ktds.domains.notice.dto;

import com.pluxity.ktds.domains.notice.entity.Notice;

import java.time.LocalDateTime;
import java.util.List;

public record NoticeResponseDTO(
        Long id,
        String title,
        String content,
        Boolean isUrgent,
        Boolean isActive,
        LocalDateTime expiredAt,
        LocalDateTime createdAt,
        List<Long> buildingIds
) {

    public static NoticeResponseDTO from(Notice notice) {
        return new NoticeResponseDTO(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getIsUrgent(),
                notice.getIsActive(),
                notice.getExpiredAt(),
                notice.getCreatedAt(),
                notice.getBuildingIds()
        );
    }
}
