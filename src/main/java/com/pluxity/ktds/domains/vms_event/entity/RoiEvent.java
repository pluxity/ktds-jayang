package com.pluxity.ktds.domains.vms_event.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roi_event")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class RoiEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_time")
    private String eventTime;

    @Column(name = "cam_id")
    private String camId;

    @Column(name = "cam_name")
    private String camName;

    @Column(name = "roi_type")
    private String roiType;

    @Column(name = "roi_name")
    private String roiName;

    @Column(name = "event_image_url", columnDefinition = "TEXT")
    private String eventImageUrl;

    @Column(name = "stream_url", columnDefinition = "TEXT")
    private String streamUrl;

    @Column(name = "video_start_time")
    private String videoStartTime;

    @Column(name = "video_end_time")
    private String videoEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vms_event_id")
    private VmsEvent vmsEvent;

    @Builder
    public RoiEvent(String eventTime, String camId, String camName, String roiType, String roiName,
                    String eventImageUrl, String streamUrl, String videoStartTime, String videoEndTime, VmsEvent vmsEvent) {
        this.eventTime = eventTime;
        this.camId = camId;
        this.camName = camName;
        this.roiType = roiType;
        this.roiName = roiName;
        this.eventImageUrl = eventImageUrl;
        this.streamUrl = streamUrl;
        this.videoStartTime = videoStartTime;
        this.videoEndTime = videoEndTime;
        this.vmsEvent = vmsEvent;
    }
}
