package com.pluxity.ktds.domains.kiosk.entity;

import java.util.Arrays;

public enum KioskCategory {
    FOOD("F&B"),
    LIFE("라이프스타일"),
    FASHION("패션"),
    SERVICE("편의/서비스");

    private final String value;

    KioskCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static KioskCategory fromValue(String value) {
        return Arrays.stream(values())
                .filter(c -> c.getValue().equals(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown category: " + value)
                );
    }
}
