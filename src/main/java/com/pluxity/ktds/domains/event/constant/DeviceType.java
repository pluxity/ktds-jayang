package com.pluxity.ktds.domains.event.constant;

public enum DeviceType {
    AHU("공기조화기"),
    FAN("급배기팬"),
    CT("냉각탑"),
    CH("냉동기"),
    BO("보일러"),
    HEX("열교환기"),
    TEMP("온도센서"),
    HTEMP("지역난방"),
    HEAT("지열히트펌프"),
    FCU("팬코일"),
    PUMP("펌프류"),
    CTH("항온항습기"),
    UPS("무정전전원장치"),
    GEN("비상발전기"),
    LV("저압 배전반"),
    HV("특고압 배전반"),
    TR("특고압 변압기"),
    RE("전등"),
    HYD("소화전(옥내,옥외)"),
    FIS("방화셔터"),
    FLS("불꽃감지기"),
    SMD("연기감지기"),
    HTD("열감지기"),
    PA("승객"),
    PAFR("승객/화물"),
    IMP("장애인"),
    FR("화물"),
    ES("승객"),
    ELEC("전기(전력량)"),
    ELC("전기차"),
    SUN("태양광"),
    PARK("주차관제"),
    GU("주차유도"),
    AIR("공기질"),
    AVI("항공장애"),
    EARTH("지진"),
    WATER("누수");

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
}

