package com.pluxity.ktds.domains.event.dto;

import com.pluxity.ktds.domains.tag.constant.AlarmStatus;

import java.time.LocalDateTime;

public record Last24HoursEventDTO(
    String buildingNm,
    int floorNm,
    String event,
    String poiName,
    LocalDateTime occurrenceDate
) {}
