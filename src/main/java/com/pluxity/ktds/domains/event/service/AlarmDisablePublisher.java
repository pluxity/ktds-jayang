package com.pluxity.ktds.domains.event.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AlarmDisablePublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${spring.rabbitmq.exchange.alarm-disable}")
    private String alarmDisableExchange = "alarm-disable";

    public AlarmDisablePublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishAlarmDisable(Long id) {
        rabbitTemplate.convertAndSend(alarmDisableExchange, "", id);
        log.info("Published alarm disable event: {}", id);
    }
}
