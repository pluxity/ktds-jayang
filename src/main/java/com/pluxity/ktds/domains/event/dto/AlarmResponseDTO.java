package com.pluxity.ktds.domains.event.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AlarmResponseDTO(
        long id,
        String deviceCd,
        String deviceNm,
        String buildingNm,
        String floorNm,
        String alarmType,
        String process,
        LocalDateTime occurrenceDate,
        LocalDateTime confirmDate
){}
