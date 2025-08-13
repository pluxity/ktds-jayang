package com.pluxity.ktds.domains.event.constant;

public enum DeviceType {
    AHU("공기조화기"),
    SF("급기팬"),
    EF("배기팬"),
    FCU("FCU"),
    P("펌프"),
    HWT("급탕탱크"),
    B("보일러"),
    IHX("빙축열"),
    ICH("냉동기"),
    ICT("냉각탑"),
    IT("축열조"),
    T("저수조"),
    IS("백엽상"),
    FPU("FPU"),
    UPS("무정전전원장치"),
    GEN("비상발전기"),
    LV("저압 배전반"),
    HV("특고압 배전반"),
    TR("특고압 변압기"),
    RE("전등"),
    LS("경관조명"),
    HYD("소화전(옥내,옥외)"),
    FDT("불꽃감지기"),
    SDT("연기감지기"),
    HTD("열감지기"),
    GDT("가스감지기"),
    ADT("공기흡입형감지기"),
    G("대표화재"),
    STU("셔터"),
    ELEV("승강기"),
    ESCL("에스컬레이터"),
    PV("PV"),
    BIPV("BIPV"),
    PARK("주차관제"),
    GU("주차유도"),
    AIR("공기질"),
    AVI("항공장애"),
    EARTH("지진"),
    WATER("누수"),
    DOOR("출입통제"),
    BELL("비상벨"),
    VAV("VAV"),
    CELL("연료전지"),
    GSHP("지열히트펌프"),
    GP("지열순환펌프"),
    CP("냉온순환펌프"),
    PE1("급탕순환펌프 1차(열교환기)"),
    PE2("급탕순환펌프 2차(급탕)"),
    COM("기타"),
    EHP("에어컨"),
    ELECH("전열");

    private final String description;

    DeviceType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static String getDescriptionByCode(String code) {
        for (DeviceType type : DeviceType.values()) {
            if (type.name().equalsIgnoreCase(code)) {
                return type.getDescription();
            }
        }
        return "알 수 없음";
    }

    public static String getCodeByDescription(String description) {
        for (DeviceType type : DeviceType.values()) {
            if (description.contains(type.getDescription())) {
                return type.name();
            }
        }
        return null;
    }
}

