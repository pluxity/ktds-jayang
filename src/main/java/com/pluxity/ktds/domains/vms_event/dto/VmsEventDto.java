package com.pluxity.ktds.domains.vms_event.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pluxity.ktds.domains.vms_event.entity.RoiEvent;
import com.pluxity.ktds.domains.vms_event.entity.VmsEvent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record VmsEventDto (
        @JsonProperty("alarm_id")
        String alarmId,
        @NotBlank
        @JsonProperty("alarm_name")
        String alarmName,
        @NotBlank
        @JsonProperty("alarm_start_time")
        String alarmStartTime,
        @NotBlank
        @JsonProperty("alarm_end_time")
        String alarmEndTime,
        @NotBlank
        @JsonProperty("stream_url")
        String streamUrl,
        @NotBlank
        @JsonProperty("thumb_image_url")
        String thumbImageUrl,
        @NotNull
        @Size(min = 1)
        @JsonProperty("roi_event_list")
        List<@Valid RoiEventDto> roiEventList
) {
    public VmsEvent toEntity() {
        VmsEvent vmsEvent = VmsEvent.builder()
                .alarmId(this.alarmId)
                .alarmName(this.alarmName)
                .alarmStartTime(this.alarmStartTime)
                .alarmEndTime(this.alarmEndTime)
                .streamUrl(this.streamUrl)
                .thumbImageUrl(this.thumbImageUrl)
                .build();

        List<RoiEvent> roiEvents = this.roiEventList.stream()
                .map(e -> e.toEntity(vmsEvent))
                .toList();

        vmsEvent.getRoiEventList().addAll(roiEvents);
        return vmsEvent;
    }
}
