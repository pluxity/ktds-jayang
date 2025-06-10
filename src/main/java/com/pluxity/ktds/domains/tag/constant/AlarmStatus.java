package com.pluxity.ktds.domains.tag.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum AlarmStatus {

    // 경보 상태 정보
    NORMAL(0, "Normal"),
    RESTORED(255, "복귀"),
    ON_ALARM(1, "ON Alarm"),
    OFF_ALARM(2, "OFF Alarm"),
    LOW_LOW_ALARM(3, "Low-Low Alarm"),
    LOW_HIGH_ALARM(4, "Low-High Alarm"),
    HIGH_LOW_ALARM(5, "High-Low Alarm"),
    HIGH_HIGH_ALARM(6, "High-High Alarm"),
    OFF_STATE_ALARM(7, "Off State Alarm"),
    ON_STATE_ALARM(8, "On State Alarm");

    private final int code;
    private final String status;

    @JsonValue
    public String getStatus() {
        return status;
    }
    @JsonCreator
    public static AlarmStatus fromCode(int code) {
        return Arrays.stream(AlarmStatus.values())
                .filter(status -> status.getCode() == code)
                .findFirst()
                .orElse(AlarmStatus.NORMAL);
    }

    @Override
    public String toString() {
        return status;
    }

    public static AlarmStatus fromLabel(String label) {
        if (label == null) return null;
        for (AlarmStatus s : AlarmStatus.values()) {
            if (s.getStatus().equalsIgnoreCase(label)) {
                return s;
            }
        }
        return null;
    }
}
