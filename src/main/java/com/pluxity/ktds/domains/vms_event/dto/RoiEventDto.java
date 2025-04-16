package com.pluxity.ktds.domains.vms_event.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pluxity.ktds.domains.vms_event.entity.RoiEvent;
import com.pluxity.ktds.domains.vms_event.entity.VmsEvent;
import jakarta.validation.constraints.NotBlank;

public record RoiEventDto(
        @NotBlank
        @JsonProperty("event_time")
        String eventTime,
        @NotBlank
        @JsonProperty("cam_id")
        String camId,
        @NotBlank
        @JsonProperty("cam_name")
        String camName,
        @NotBlank
        @JsonProperty("roi_type")
        String roiType,
        @NotBlank
        @JsonProperty("roi_name")
        String roiName,
        @NotBlank
        @JsonProperty("event_image_url")
        String eventImageUrl,
        @NotBlank
        @JsonProperty("stream_url")
        String streamUrl,
        @NotBlank
        @JsonProperty("video_start_time")
        String videoStartTime,
        @NotBlank
        @JsonProperty("video_end_time")
        String videoEndTime
) {

    public RoiEvent toEntity(VmsEvent vmsEvent) {
        return RoiEvent.builder()
                .eventTime(this.eventTime)
                .camId(this.camId)
                .camName(this.camName)
                .roiType(this.roiType)
                .roiName(this.roiName)
                .eventImageUrl(this.eventImageUrl)
                .streamUrl(this.streamUrl)
                .videoStartTime(this.videoStartTime)
                .videoEndTime(this.videoEndTime)
                .vmsEvent(vmsEvent)
                .build();
    }
}
