package com.pluxity.ktds.domains.event.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum AllowedEventType {

    ALARM_KR("경보"),
    ALARM_EN("Alarm"),
    FORCED_DOOR_OPEN("강제문열림"),
    LONG_DOOR_OPEN("장시간 문열림"),
    FIRST_CLOSURE("1차폐쇄"),
    SECOND_CLOSURE("2차폐쇄"),
    FAULT("고장"),
    UNDER_INSPECTION("점검중"),
    PARKING("파킹"),
    INDEPENDENT_OPERATION("독립운전"),
    OVERWEIGHT("중량초과"),
    FIRE_CONTROL_OPERATION("화재관제운전"),
    FIRE_CONTROL_RETURN("화재관제운전 귀착"),
    FIRST_FIRE_OPERATION("1차소방운전"),
    SECOND_FIRE_OPERATION("2차소방운전"),
    EXCLUSIVE_OPERATION("전용운전"),
    MAINTENANCE_OPERATION("보수운전"),
    POWER_OUTAGE_OPERATION("정전운전"),
    FIRE_OPERATION("화재운전"),
    EARTHQUAKE_OPERATION("지진운전"),
    WANDERING_EVENT("배회이벤트");

    private final String label;

    /**
     * 모든 허용된 이벤트 타입의 라벨 리스트 반환
     */
    public static List<String> getAllLabels() {
        return Arrays.stream(values())
                .map(AllowedEventType::getLabel)
                .collect(Collectors.toList());
    }
}
