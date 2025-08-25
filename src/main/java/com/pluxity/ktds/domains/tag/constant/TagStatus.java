package com.pluxity.ktds.domains.tag.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum TagStatus {

    // 태그 상태 정보
    NORMAL(0, "Normal"),
    UNLOAD(128, "Unload"),
    FAILED(1, "Failed"),
    OUT_OF_SERVICE(2, "OutOfService"),
    SYSTEM_ALARM(4, "SystemAlarm");

    private final int code;
    private final String status;

    @JsonCreator
    public static TagStatus from(Object input) {
        if (input instanceof Number) {
            int code = ((Number) input).intValue();
            return Arrays.stream(TagStatus.values())
                    .filter(s -> s.getCode() == code)
                    .findFirst()
                    .orElse(TagStatus.NORMAL);
        } else if (input instanceof String) {
            String status = (String) input;
            return Arrays.stream(TagStatus.values())
                    .filter(s -> s.getStatus().equalsIgnoreCase(status))
                    .findFirst()
                    .orElse(TagStatus.NORMAL);
        }
        return TagStatus.NORMAL;
    }

//    @JsonCreator
//    public static TagStatus fromCode(int code) {
//        return Arrays.stream(TagStatus.values())
//                .filter(status -> status.getCode() == code)
//                .findFirst()
//                .orElse(TagStatus.NORMAL);
//    }

    @Override
    public String toString() {
        return status;
    }

    @JsonValue
    public String getStatus() {
        return status;
    }
}
