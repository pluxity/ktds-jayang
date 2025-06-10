package com.pluxity.ktds.domains.tag.constant;

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

    public static TagStatus fromCode(int code) {
        return Arrays.stream(TagStatus.values())
                .filter(status -> status.getCode() == code)
                .findFirst()
                .orElse(TagStatus.NORMAL);
    }

    @Override
    public String toString() {
        return status;
    }
}
