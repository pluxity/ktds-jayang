package com.pluxity.ktds.global.constant;

public enum ExcelHeaderNameCode {
    POI_CATEGORY_NAME("장비분류명"),
    POI_MIDDLE_CATEGORY_NAME("중분류명"),
    POI_ICONSET_NAME("장비아이콘명"),
    POI_CODE("장비 코드"),
    POI_NAME("장비 이름"),
    TAG_NAME("태그명"),
    LIGHT_GROUP("릴레이 그룹"),
    MAIN_CCTV("지정카메라"),
    SUB_CCTV1("주변카메라1"),
    SUB_CCTV2("주변카메라2"),
    SUB_CCTV3("주변카메라3"),
    SUB_CCTV4("주변카메라4");

    public final String value;

    ExcelHeaderNameCode(String value) {
        this.value = value;
    }
}
