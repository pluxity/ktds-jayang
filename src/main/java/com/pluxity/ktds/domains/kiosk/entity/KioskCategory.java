package com.pluxity.ktds.domains.kiosk.entity;

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

}
