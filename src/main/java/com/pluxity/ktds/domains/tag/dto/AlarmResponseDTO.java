package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.pluxity.ktds.domains.tag.CustomDeserializer;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record AlarmResponseDTO(
        @JsonProperty("ALMCNT")
        int alarmCnt,
        @JsonProperty("TimeStamp")
        long timestamp,
        @JsonProperty("LIST")
        List<AlarmData> alarmDataList
) {
}
