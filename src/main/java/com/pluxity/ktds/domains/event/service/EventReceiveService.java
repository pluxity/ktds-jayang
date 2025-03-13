package com.pluxity.ktds.domains.event.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventReceiveService {

    private final EventEmitterService eventEmitterService;
    private final ObjectMapper mapper;

    @Value("${spring.rabbitmq.queue.alarm-disable-1}")
    private String alarmDisableQueue1;


    //    알람 consumer
    @RabbitListener(queues = "alarm.queue")
    public void receiveEvent(String alarm) {
        try{
            AlarmResponseDTO alarmResponseDTO = mapper.readValue(alarm, AlarmResponseDTO.class);
            log.info("alarmResponseDTO: {}", alarmResponseDTO);
            eventEmitterService.sendEvent("newAlarm", alarmResponseDTO);
        }catch (JsonProcessingException e) {
            log.error("Failed to parse event: {}", alarm);
        }
    }

    @RabbitListener(queues = "#{alarmDisableQueue1}")
    public void receiveDisableAlarm(Long id){
        log.info("receiveDisableAlarm: {}", id);
        eventEmitterService.sendEvent("disableAlarm", id);
    }


//    알람 해제 consumer(polling server에서 받은 id로 알람 해제)
//    @RabbitListener(queues = "event.queue.disable")
//    public void receiveDisableEvent(Long id){
//        log.info("receiveDisableEvent: {}", id);
//        eventEmitterService.sendEvent("disableAlarm", id);
//    }


    // 테스트용 30초마다 알람 발생
//    @Scheduled(fixedRate = 10000)
//    public void sendTestEvent() {
//        try {
//            AlarmResponseDTO testAlarm = AlarmResponseDTO.builder()
//                .id(1)
//                .deviceCd("TEST-001")
//                .deviceNm("테스트장비-001")
//                .buildingNm("A동")
//                .floorNm("3F")
//                .process("반도체")
//                .alarmType("DANGER")
//                .occurrenceDate(LocalDateTime.now())
//                .build();
//
//            eventEmitterService.sendEvent("newAlarm", testAlarm);
//            log.info("Sent test event: {}", testAlarm);
//        } catch (Exception e) {
//            log.error("Failed to send test event", e);
//        }
//    }
}
