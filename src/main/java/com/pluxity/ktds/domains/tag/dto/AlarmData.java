package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.*;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import lombok.Builder;

@Builder
public record AlarmData(
        @JsonAlias("T")
        String occurrenceDate,
        @JsonAlias("N")
        String tagName,
        @JsonAlias("V")
        String tagValue,
        @JsonAlias("S")
        AlarmStatus alarmStatus,
        @JsonAlias("Y")
        AlarmStatus alarmType,
        @JsonAlias("A")
        int confirmStatus,
        @JsonAlias("E")
        String confirmTime
) {
}
