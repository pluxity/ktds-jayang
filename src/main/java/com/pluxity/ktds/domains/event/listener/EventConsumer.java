package com.pluxity.ktds.domains.event.listener;

import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.event.service.EventEmitterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;


@Service
@Slf4j
@RequiredArgsConstructor
public class EventConsumer {

    private final EventEmitterService eventEmitterService;

    @RabbitListener(queues = "#{@wasAlarmQueue.name}")
    public void receiveEvent(AlarmResponseDTO alarm) {
        log.info("alarmResponseDTO: {}", alarm);
        eventEmitterService.sendAlarm(alarm);
    }

    @RabbitListener(queues = "#{@wasAlarmDisableQueue.name}")
    public void receiveDisableAlarm(Long id){
        log.info("receiveDisableAlarm: {}", id);
        eventEmitterService.sendDisableAlarm(id);
    }
}
