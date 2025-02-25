package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import com.pluxity.ktds.domains.tag.constant.TagStatus;

public record TagData(
        @JsonProperty("T")
        String tagName,
        @JsonProperty("V")
        String currentValue,
        @JsonProperty("S")
        TagStatus tagStatus,
        @JsonProperty("A")
        AlarmStatus alarmStatus
) {
}
