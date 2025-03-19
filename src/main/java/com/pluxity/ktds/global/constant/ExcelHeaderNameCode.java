package com.pluxity.ktds.global.constant;

public enum ExcelHeaderNameCode {
    POI_CATEGORY_NAME("장비분류명"),
    POI_MIDDLE_CATEGORY_NAME("중분류명"),
    POI_ICONSET_NAME("장비아이콘명"),
    POI_CODE("장비 코드"),
    POI_NAME("장비 이름"),
    TAG_NAME("태그명");

    public final String value;

    ExcelHeaderNameCode(String value) {
        this.value = value;
    }
}
