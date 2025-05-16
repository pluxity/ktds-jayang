package com.pluxity.ktds.domains.tag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class ElevatorTagManager {

    @Getter
    @AllArgsConstructor
    public enum ElevatorABTag {

        CurrentFloor("CurrentFloor", Map.ofEntries(
                Map.entry("P4", "-5"),
                Map.entry("P3", "-4"),
                Map.entry("P2", "-3"),
                Map.entry("P1", "-2"),
                Map.entry("B1", "-1"),
                Map.entry("0G", "0"),
                Map.entry("1F", "1"),
                Map.entry("2F", "2"),
                Map.entry("3F", "3")
        )),
        Direction("Direction", Map.of("0", "STOP", "1", "UP", "2", "DOWN")),
        Door("Door", Map.of("0", "Open", "1", "Close")),
        DrivingState("DrivingState", Map.of("0", "정상운전", "1", "운전휴지", "2", "독립운전", "3", "전용운전", "4", "보수운전", "5", "정전운전", "6", "화재운전", "7", "지진운전", "8", "고장"));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum ElevatorCTag {
        CurrentFloor("CurrentFloor", Map.ofEntries(
                Map.entry("P5", "-6"),
                Map.entry("P4", "-5"),
                Map.entry("P3", "-4"),
                Map.entry("P2", "-3"),
                Map.entry("P1", "-2"),
                Map.entry("B1", "-1"),
                Map.entry("0G", "0"),
                Map.entry("1F", "1"),
                Map.entry("2F", "2"),
                Map.entry("3F", "3"),
                Map.entry("4F", "4")
        )),
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
        FireControlDrivingResults("Fire control driving results", Map.of("0", "OFF", "1", "화재관제운전 귀착")),
        FirstFireDriving("1st fire driving", Map.of("0", "OFF", "1", "1차소방운전")),
        SecondFireDriving("Second fire driving", Map.of("0", "OFF", "1", "2차소방운전"));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

    @Getter
    @AllArgsConstructor
    public enum EscalatorTag {
        UpDir("UpDir", Map.of("0", "OFF", "1", "상향")),
        DownDir("DownDir", Map.of("0", "OFF", "1", "하향")),
        Stop("Stop", Map.of("0", "OFF", "1", "정지")),
        Run("Run", Map.of("0", "OFF", "1", "운행")),
        Fault("Fault", Map.of("0", "OFF", "1", "고장"));

        private final String tagName;
        private final Map<String, String> valueMap;

        public String getValueDescription(String value) {
            return valueMap.get(value);
        }
    }

}
