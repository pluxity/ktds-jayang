package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record HistoryResponseDTO(
        Long historyId,
        Long buildingId,
        Long fileId,
        String buildingVersion,
        String historyContent,
        String regUser,
        LocalDateTime createdAt,
        String fileName
) {}
