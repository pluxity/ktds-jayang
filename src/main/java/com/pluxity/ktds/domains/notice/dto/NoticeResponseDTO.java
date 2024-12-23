package com.pluxity.ktds.domains.notice.dto;

import com.pluxity.ktds.domains.notice.entity.Notice;

import java.time.LocalDateTime;

public record NoticeResponseDTO(
        String title,
        String content,
        Boolean isUrgent,
        LocalDateTime expiredAt
) {

    public static NoticeResponseDTO from(Notice notice) {
        return new NoticeResponseDTO(
                notice.getTitle(),
                notice.getContent(),
                notice.getIsUrgent(),
                notice.getExpiredAt()
        );
    }
}
