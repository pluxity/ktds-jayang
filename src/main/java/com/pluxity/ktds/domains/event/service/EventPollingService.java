package com.pluxity.ktds.domains.event.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.event.constant.DeviceType;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import com.pluxity.ktds.domains.tag.CustomParser;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import com.pluxity.ktds.domains.event.entity.Alarm;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPollingService {


    private final ObjectMapper mapper;
    private final EventEmitterService eventEmitterService;
    private final EventRepository eventRepository;
    private final TagClientService tagClientService;

    private long lastPollingTime = 0;

    @Scheduled(fixedRate = 1000)
    void fetchLatestEvents() throws JsonProcessingException {
        initializeLastPollingTime();
        List<Alarm> newAlarms = pollNewAlarms();
        if (!newAlarms.isEmpty()) {
            processNewAlarms(newAlarms);
        }
    }

    private void initializeLastPollingTime() {
        if (lastPollingTime == 0) {
            lastPollingTime = eventRepository.findLastEventTime()
                    .map(date -> date.toEpochSecond(ZoneOffset.UTC))
                    .orElse(Instant.now().minus(24, ChronoUnit.HOURS).getEpochSecond());
        }
    }

    private List<Alarm> pollNewAlarms() throws JsonProcessingException {
//        ResponseEntity<String> response = tagClientService.readAlarms(lastPollingTime);

        String testInpit = "{\"ALMCNT\":10,\"TimeStamp\":1739876894,\"LIST\":[{\"T\":\"2025/03/05 19:31:20\",\"N\":\"1-5-FC-AHU-01-AI-A01_SF_TEMP\",\"V\":\"0\",\"S\":0,\"Y\":255,\"A\":0,\"\"}]}";
        String json = CustomParser.fixedJson2(testInpit);
//        String json = CustomParser.fixedJson2(response.getBody());
        JsonNode rootNode = mapper.readTree(json);
        JsonNode listNode = rootNode.get("LIST");

        if (listNode != null && listNode.size() > 0) {

            List<Alarm> alarms = new ArrayList<>();

           for(JsonNode node : listNode) {
               alarms.add(mapToAlarm(node));
           }

           log.info("alarms = {}", alarms);
           return alarms;
        }
        return Collections.emptyList();
    }

    private void processNewAlarms(List<Alarm> alarms) {
        updateLastPollingTime(alarms);
        saveAndNotifyAlarms(alarms);
    }

    private void updateLastPollingTime(List<Alarm> alarms) {
        lastPollingTime = alarms.stream()
                .mapToLong(alarm -> alarm.getOccurrenceDate().toEpochSecond(ZoneOffset.UTC))
                .max()
                .orElse(lastPollingTime);
        log.info("lastPollingTime = {}", lastPollingTime);
    }

    private void saveAndNotifyAlarms(List<Alarm> alarms) {
        eventRepository.saveAll(alarms);
        alarms.forEach(alarm -> eventEmitterService.sendEvent("alarm", alarm));
    }

    private Alarm mapToAlarm(JsonNode node) {
        String occurrenceDate = node.get("T").asText();
        int alarmType = Integer.parseInt(node.get("Y").asText());
        String confirmTime = node.get("E").asText();
        LocalDateTime parsedConfirmTime = null;

        if (confirmTime != null && !confirmTime.isEmpty()) {
            parsedConfirmTime = LocalDateTime.parse(confirmTime, DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"));
        }

        String nValue = node.get("N").asText();
        String[] parts = nValue.split("-");
        String building = parts[0];
        String floor = parts[1];
        String process = parts[2];
        String device = parts[3];
        String deviceNumber = parts[4];

        return Alarm.builder()
        .deviceCd(device+"-"+deviceNumber)
        .deviceNm(DeviceType.getDescriptionByCode(device)+"-"+deviceNumber)
        .buildingNm(building)
        .floorNm(floor)
        .process(process)
        .alarmType(AlarmStatus.fromCode(alarmType))
        .occurrenceDate(LocalDateTime.parse(occurrenceDate, DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")))
        .confirmTime(parsedConfirmTime)
        .build();
    }
}
