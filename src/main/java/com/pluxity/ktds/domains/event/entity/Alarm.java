package com.pluxity.ktds.domains.event.entity;

import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "alarm")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Alarm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_cd")
    @Comment("장비 코드")
    private String deviceCd;

    @Column(name = "device_nm")
    @Comment("장비 이름")
    private String deviceNm;

    @Column(name = "building_nm")
    @Comment("건물")
    private String buildingNm;

    @Column(name = "floor_nm")
    @Comment("층")
    private String floorNm;

    @Column(name = "process")
    @Comment("공정명")
    private String process;

    @Column(name = "equipment")
    @Comment("장비")
    private String equipment;

    @Column(name = "event")
    @Comment("이벤트명")
    private String event;

    @Enumerated(EnumType.STRING)
    @Column(name = "alarm_type", columnDefinition = "VARCHAR(255) DEFAULT 'NORMAL'")
    @Comment("알람 종류")
    private AlarmStatus alarmType;

    @Column(name = "confirm_time", nullable = true)
    @Comment("확인 시간")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime confirmTime;

    @Column(name = "occurrence_date")
    @Comment("발생 시간")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime occurrenceDate;

    @Column(name = "tag_name")
    @Comment("태그 이름")
    private String tagName;

    @Column(name = "tag_value")
    @Comment("태그 값")
    private String tagValue;

    public void updateConfirmTime(LocalDateTime confirmTime) {
        this.confirmTime = confirmTime;
    }

    public AlarmResponseDTO toResponseDTO() {
        return AlarmResponseDTO.builder()
                .id(this.getId())
                .deviceCd(this.deviceCd)
                .deviceNm(this.deviceNm)
                .alarmType(this.alarmType.getStatus())
                .tagName(this.tagName)
                .tagValue(this.tagValue)
                .buildingNm(this.buildingNm)
                .floorNm(this.floorNm)
                .process(this.process)
                .equipment(this.equipment)
                .event(this.event)
                .occurrenceDate(this.occurrenceDate)
                .confirmDate(this.confirmTime)
                .build();
    }

}