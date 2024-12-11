package com.pluxity.ktds.domains.plx_file.constant;

public enum FileEntityType {
    BUILDING("Building"),
    ICON2D("2D"),
    ICON3D("3D"),
    CATEGORY_IMAGE("CATEGORY");

    private final String type;

    FileEntityType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
