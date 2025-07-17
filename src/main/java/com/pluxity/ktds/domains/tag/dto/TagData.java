package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import com.pluxity.ktds.domains.tag.constant.TagStatus;

public record TagData(
        @JsonAlias("T")
        String tagName,
        @JsonAlias("V")
        String currentValue,
        // 태그 상태
        @JsonAlias("S")
        TagStatus tagStatus,
        // 알람 종류
        @JsonAlias("A")
        AlarmStatus alarmStatus
) {
}
