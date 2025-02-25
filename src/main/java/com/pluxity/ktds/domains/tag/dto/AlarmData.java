package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.pluxity.ktds.domains.tag.CustomDeserializer;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;

import java.util.List;
import java.util.Map;
public record AlarmData(
        @JsonProperty("T")
        String occurrenceDate,
        @JsonProperty("N")
        String tagName,
        @JsonProperty("V")
        String tagValue,
        @JsonProperty("S")
        AlarmStatus alarmStatus,
        @JsonProperty("Y")
        AlarmStatus alarmType,
        @JsonProperty("A")
        int confirmStatus,
        @JsonProperty("E")
        String confirmTime
) {
}
