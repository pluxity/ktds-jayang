package com.pluxity.ktds.domains.event.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.event.service.EventEmitterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventConsumer {

    private final EventEmitterService eventEmitterService;
    private final ObjectMapper mapper;

//    //    알람 consumer
//    @RabbitListener(queues = "${rabbitmq.queue.alarm-was1}")
//    public void receiveEvent(String alarm) {
//        try{
//            AlarmResponseDTO alarmResponseDTO = mapper.readValue(alarm, AlarmResponseDTO.class);
//            log.info("alarmResponseDTO: {}", alarmResponseDTO);
//            eventEmitterService.sendEvent("newAlarm", alarmResponseDTO);
//        }catch (JsonProcessingException e) {
//            log.error("Failed to parse event: {}", alarm);
//        }
//    }

    // 알람 해제 consumer(mq)
    @RabbitListener(queues = "${rabbitmq.queue.alarm-disable}")
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


    //테스트용 30초마다 알람 발생
    @Scheduled(fixedRate = 10000)
    public void sendTestEvent() {
        try {
            AlarmResponseDTO testAlarm = AlarmResponseDTO.builder()
                .id(1)
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
