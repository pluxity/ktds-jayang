package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record HistoryResponseDTO(
        Long historyId,
        Long buildingId,
        FileInfoDTO fileInfo,
        String buildingVersion,
        String historyContent,
        String regUser,
        String createdAt,
        String fileName
) {}
