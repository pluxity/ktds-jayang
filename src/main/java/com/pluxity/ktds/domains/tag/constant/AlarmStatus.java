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
    public static AlarmStatus from(Object input) {
        if (input instanceof Number) {
            int code = ((Number) input).intValue();
            return Arrays.stream(values())
                    .filter(a -> a.code == code)
                    .findFirst()
                    .orElse(NORMAL);
        } else if (input instanceof String) {
            String label = (String) input;
            for (AlarmStatus a : values()) {
                if (a.status.equalsIgnoreCase(label) || a.name().equalsIgnoreCase(label)) {
                    return a;
                }
            }
        }
        return NORMAL;
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

    public static String normalizeLabel(String label) {
        if (label == null || label.isBlank()) return null;

        for (AlarmStatus s : values()) {
            if (s.name().equalsIgnoreCase(label)
                    || s.getStatus().equalsIgnoreCase(label)) {
                return s.name();
            }
        }
        return label;
    }
}
