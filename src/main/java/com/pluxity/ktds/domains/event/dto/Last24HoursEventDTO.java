package com.pluxity.ktds.domains.event.dto;

import com.pluxity.ktds.domains.tag.constant.AlarmStatus;

import java.time.LocalDateTime;

public record Last24HoursEventDTO(
    String buildingNm,
    String floorNm,
    AlarmStatus alarmType,
    String deviceNm,
    LocalDateTime occurrenceDate
) {}
