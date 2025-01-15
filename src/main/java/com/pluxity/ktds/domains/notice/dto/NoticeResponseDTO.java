package com.pluxity.ktds.domains.notice.dto;

import com.pluxity.ktds.domains.notice.entity.Notice;

import java.time.LocalDateTime;

public record NoticeResponseDTO(
        Long id,
        String title,
        String content,
        Boolean isUrgent,
        LocalDateTime expiredAt,
        LocalDateTime createdAt
) {

    public static NoticeResponseDTO from(Notice notice) {
        return new NoticeResponseDTO(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getIsUrgent(),
                notice.getExpiredAt(),
                notice.getCreatedAt()
        );
    }
}
