package com.pluxity.ktds.global.constant;

public enum ExcelHeaderNameCode {
    POI_CATEGORY_NAME("장비분류명"),
    POI_ICONSET_NAME("장비아이콘명"),
    POI_CODE("장비 코드"),
    POI_NAME("장비 이름");

    public final String value;

    ExcelHeaderNameCode(String value) {
        this.value = value;
    }
}
