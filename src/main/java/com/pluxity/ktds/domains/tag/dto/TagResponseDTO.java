package com.pluxity.ktds.domains.tag.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public record TagResponseDTO(
        @JsonProperty("TAGCNT")
        int tagCnt,
        @JsonProperty("TimeStamp")
        Long timestamp,
        @JsonProperty("TAGs")
        List<TagData> tags
) {
}
