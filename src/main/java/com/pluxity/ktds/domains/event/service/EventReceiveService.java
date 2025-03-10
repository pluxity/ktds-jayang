package com.pluxity.ktds.domains.event.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventReceiveService {

    private final EventEmitterService eventEmitterService;
    private final ObjectMapper mapper;

//    @RabbitListener(queues = "alarm.exchange")
//    public void receiveEvent(String alarm) {
//        log.info("Received event: {}", alarm);
//        try{
//            AlarmResponseDTO alarmResponseDTO = mapper.readValue(alarm, AlarmResponseDTO.class);
//            log.info("Received event: {}", alarmResponseDTO);
//            eventEmitterService.sendEvent("newAlarm", alarmResponseDTO);
//        }catch (JsonProcessingException e) {
//            log.error("Failed to parse event: {}", alarm);
//        }
//
//    }

    // 테스트용 30초마다 알람 발생
    @Scheduled(fixedRate = 30000)
    public void sendTestEvent() {
        try {
            AlarmResponseDTO testAlarm = AlarmResponseDTO.builder()
                .deviceCd("TEST-001")
                .deviceNm("테스트장비-001")
                .buildingNm("A동")
                .floorNm("3F")
                .process("반도체")
                .alarmType("DANGER")
                .occurrenceDate(LocalDateTime.now())
                .build();

            eventEmitterService.sendEvent("newAlarm", testAlarm);
            log.info("Sent test event: {}", testAlarm);
        } catch (Exception e) {
            log.error("Failed to send test event", e);
        }
    }
}
