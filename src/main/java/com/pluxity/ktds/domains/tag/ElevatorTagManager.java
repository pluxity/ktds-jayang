package com.pluxity.ktds.domains.tag;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.*;
import java.util.stream.Collectors;

public class ElevatorTagManager {

    private static Map<String,String> createFloorMap2(int maxP, int maxF) {
        Map<String,String> m = new LinkedHashMap<>();
        for(int p = maxP; p >= 1; p--) {
            m.put("P" + p, String.valueOf(-(p + 1)));
        }
        m.put("B1", "-1");
        m.put("0G", "0");
        for(int f = 1; f <= maxF; f++) {
            m.put(f + "F", String.valueOf(f));
        }

        return Collections.unmodifiableMap(m);
    }

    private static Map<String, String> createFloorMap(int maxP, int maxF) {
        Map<String, String> m = new LinkedHashMap<>();

        for (int p = maxP; p >= 1; p--) {
            m.put("P" + p, String.valueOf(-(p + 1)));
        }
        m.put("B1", "-1");
        m.put("0G", "0");
        for (int f = 1; f <= maxF; f++) {
            m.put(f + "F", String.valueOf(f));
        }

        return Collections.unmodifiableMap(m);
    }

    private static Map<String, String> reverse(Map<String, String> map) {
        Map<String, String> reversed = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : map.entrySet()) {
            reversed.put(entry.getValue(), entry.getKey()); // raw → 표현
        }
        return Collections.unmodifiableMap(reversed);
    }

    @Getter
    @AllArgsConstructor
    public enum ElevatorABTag {

        CurrentFloor("층위치", reverse(createFloorMap(10, 40))),
        Direction("방향", Map.of("0", "멈춤", "1", "상행", "2", "하행")),
        Door("도어상태", Map.of("0", "문열림", "1", "문닫힘")),
        DrivingState("승강기상태", Map.of("0", "정상운전", "1", "운전휴지", "2", "독립운전", "3", "전용운전", "4", "보수운전", "5", "정전운전", "6", "화재운전", "7", "지진운전", "8", "고장"));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum ElevatorCTag {
        CurrentFloor("CurrentFloor", reverse(createFloorMap(10, 40))),
        UpDir("UpDir", Map.of("0", "OFF", "1", "상향")),
        DownDir("DownDir", Map.of("0", "OFF", "1", "하향")),
        Driving("Driving", Map.of("0", "OFF", "1", "주행중")),
        AUTO("AUTO", Map.of("0", "OFF", "1", "자동운전")),
        DoorOpened("Door opened", Map.of("0", "OFF", "1", "문열림")),
        EMCB("EMCB", Map.of("0", "OFF", "1", "고장상태에서 비상버튼 호출")),
        EMCF("EMCF", Map.of("0", "OFF", "1", "정상상태에서 비상버튼 호출")),
        Fault("Fault", Map.of("0", "OFF", "1", "고장")),
        Checking("Checking", Map.of("0", "OFF", "1", "점검중")),
        Parking("Parking", Map.of("0", "OFF", "1", "파킹")),
        IndependentDriving("Independent driving", Map.of("0", "OFF", "1", "독립운전")),
        Overweight("Overweight", Map.of("0", "OFF", "1", "중량초과")),
        FireControlDriving("Fire control driving", Map.of("0", "OFF", "1", "화재관제운전")),
        FireControlDrivingResults("Fire control driving results", Map.of("0", "OFF", "1", "화재관제운전귀착")),
        FirstFireDriving("1st fire driving", Map.of("0", "OFF", "1", "1차소방운전")),
        SecondFireDriving("Second fire driving", Map.of("0", "OFF", "1", "2차소방운전"));

        private final String tagName;
        private final Map<String, String> valueMap;
        private static final Map<String, ElevatorCTag> BY_TAG_NAME =
                Arrays.stream(values())
                        .collect(Collectors.toMap(ElevatorCTag::getTagName, e -> e));

        public static ElevatorCTag fromTagName(String tagName) {
            ElevatorCTag e = BY_TAG_NAME.get(tagName);
            if (e == null) {
                throw new IllegalArgumentException("Unknown tagName: " + tagName);
            }
            return e;
        }

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum EscalatorTag {
        UpDir("상향", Map.of("0", "OFF", "1", "상향")),
        DownDir("하향", Map.of("0", "OFF", "1", "하향")),
        Stop("정지", Map.of("0", "OFF", "1", "정지")),
        Run("운행", Map.of("0", "OFF", "1", "운행")),
        Fault("고장", Map.of("0", "OFF", "1", "고장"));

        private final String tagName;
        private final Map<String, String> valueMap;
        private static final Map<String, EscalatorTag> BY_TAG_NAME =
                Arrays.stream(values())
                        .collect(Collectors.toMap(EscalatorTag::getTagName, e -> e));

        public static EscalatorTag fromEnumName(String enumName) {
            return EscalatorTag.valueOf(enumName);
        }

        public static EscalatorTag fromTagName(String tagName) {
            EscalatorTag e = BY_TAG_NAME.get(tagName);
            if (e == null) {
                throw new IllegalArgumentException("Unknown tagName: " + tagName);
            }
            return e;
        }

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum VavTag {
        COOL_HEAT("COOL_HEAT", Map.of("0", "냉방", "1", "난방")),
        MANUAL_DMP_OPEN("MANUAL_DMP_OPEN", Map.of("0", "자동", "1", "100%개방")),
        FAN("FAN", Map.of("0", "정지", "1", "기동")),
        VLV_24V_ON_OFF("VLV_24V_ON_OFF", Map.of("0", "닫힘", "1", "열림"));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum HeHTag {
        Status("상태", Map.of("0", "OFF", "1", "ON")),
        Alarm("경보", Map.of("0", "Normal", "1", "Alarm")),
        Auto("자동수동", Map.of("0", "수동", "1", "자동")),
        Heating("냉방난방", Map.of("0", "냉방", "1", "난방")),
        Stop("운전정지", Map.of("0", "OFF", "1", "ON"));

        private final String tagName;
        private final Map<String, String> valueMap;

        private static final Map<String, HeHTag> BY_TAG_NAME =
                Arrays.stream(values())
                        .collect(Collectors.toMap(HeHTag::getTagName, e -> e));

        public static HeHTag fromTagName(String tagName) {
            HeHTag e = BY_TAG_NAME.get(tagName);
            if (e == null) {
                throw new IllegalArgumentException("Unknown tagName: " + tagName);
            }
            return e;
        }

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum CellTag {
        DEVSTAT("장비상태", Map.of(
                "0", "운전대기",
                "1", "운전대기",
                "2", "정격운전(발전)",
                "3", "정지중(Shut down)",
                "4", "발전모드 변경중"
        ));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }
}
