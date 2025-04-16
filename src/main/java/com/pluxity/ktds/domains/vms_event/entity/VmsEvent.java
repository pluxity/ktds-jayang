package com.pluxity.ktds.domains.vms_event.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vms_event")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class VmsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alarm_id")
    private String alarmId;

    @Column(name = "alarm_name")
    private String alarmName;

    @Column(name = "alarm_start_time")
    private String alarmStartTime;

    @Column(name = "alarm_end_time")
    private String alarmEndTime;

    @Column(name = "stream_url", columnDefinition = "TEXT")
    private String streamUrl;

    @Column(name = "thumb_image_url", columnDefinition = "TEXT")
    private String thumbImageUrl;

    @OneToMany(mappedBy = "vmsEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoiEvent> roiEventList = new ArrayList<>();

    @Builder
    public VmsEvent(String alarmId, String alarmName, String alarmStartTime, String alarmEndTime,
                    String streamUrl, String thumbImageUrl, List<RoiEvent> roiEventList) {
        this.alarmId = alarmId;
        this.alarmName = alarmName;
        this.alarmStartTime = alarmStartTime;
        this.alarmEndTime = alarmEndTime;
        this.streamUrl = streamUrl;
        this.thumbImageUrl = thumbImageUrl;
        this.roiEventList = roiEventList != null ? roiEventList : new ArrayList<>();
    }
}
