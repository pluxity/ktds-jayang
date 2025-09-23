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

    //    알람 consumer
    @RabbitListener(queues = "${rabbitmq.queue.alarm-was2}")
    public void receiveEvent(AlarmResponseDTO alarm) {
            log.info("alarmResponseDTO: {}", alarm);
            eventEmitterService.sendAlarm(alarm);
    }
    // 알람 해제 consumer(mq)
    @RabbitListener(queues = "${rabbitmq.queue.alarm-disable-was2}")
    public void receiveDisableAlarm(Long id){
        log.info("receiveDisableAlarm: {}", id);
        eventEmitterService.sendDisableAlarm(id);
    }
}
