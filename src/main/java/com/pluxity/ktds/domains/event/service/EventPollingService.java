package com.pluxity.ktds.domains.event.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.event.constant.DeviceType;
import com.pluxity.ktds.domains.event.repository.EventPollingRepository;
import com.pluxity.ktds.domains.tag.CustomParser;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.pluxity.ktds.domains.event.entity.Alarm;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPollingService {


    private final ObjectMapper mapper;
    private final EventEmitterService eventEmitterService;
    private final EventPollingRepository eventPollingRepositoryRepository;
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
            lastPollingTime = eventPollingRepositoryRepository.findLastEventTime()
                    .map(date -> date.atZone(ZoneId.of("Asia/Seoul")).toEpochSecond())
                    .orElse(Instant.now().atZone(ZoneId.of("Asia/Seoul")).minusHours(24).toEpochSecond());
        }
    }

    private List<Alarm> pollNewAlarms() throws JsonProcessingException {
        ResponseEntity<String> response = tagClientService.readAlarms(lastPollingTime);

        String json = CustomParser.fixedJson2(response.getBody());
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
                .mapToLong(alarm -> alarm.getOccurrenceDate().atZone(ZoneId.of("Asia/Seoul")).toEpochSecond())
                .max()
                .orElse(lastPollingTime);
    }

    private void saveAndNotifyAlarms(List<Alarm> alarms) {
        eventPollingRepositoryRepository.saveAll(alarms);
        alarms.forEach(alarm -> eventEmitterService.sendEvent("alarm", alarm));
    }

    private Alarm mapToAlarm(JsonNode node) {
        String occurrenceDate = node.get("T").asText();
        int alarmType = Integer.parseInt(node.get("Y").asText());
        String confirmTime = node.get("E").asText();
        LocalDateTime parsedConfirmTime = null;

        if (confirmTime != null && !confirmTime.isEmpty()) {
            parsedConfirmTime = LocalDateTime.parse(confirmTime, DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"))
                    .atZone(ZoneId.of("Asia/Seoul"))
                    .toLocalDateTime();
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
        .occurrenceDate(LocalDateTime.parse(occurrenceDate, DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"))
                .atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
        .confirmTime(parsedConfirmTime)
        .build();
    }
}
