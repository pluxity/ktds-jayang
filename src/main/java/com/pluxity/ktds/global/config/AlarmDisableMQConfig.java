package com.pluxity.ktds.global.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AlarmDisableMQConfig {

    @Value("${spring.rabbitmq.exchange.alarm-disable}")
    private String alarmDisableExchange;

    @Value("${spring.rabbitmq.queue.alarm-disable-1}")
    private String alarmDisableQueue1;

    @Value("${spring.rabbitmq.queue.alarm-disable-2}")
    private String alarmDisableQueue2;


    @Bean
    public FanoutExchange alarmDisableFanoutExchange() {
        return new FanoutExchange(alarmDisableExchange);
    }

    @Bean
    public Queue alarmDisableQueue1() {
        return new Queue(alarmDisableQueue1);
    }

    @Bean
    public Queue alarmDisableQueue2() {
        return new Queue(alarmDisableQueue2);
    }

    @Bean
    public Binding bindingAlarmDisableQueue_1(Queue alarmDisableQueue1, FanoutExchange alarmDisableFanoutExchange) {
        return BindingBuilder.bind(alarmDisableQueue1).to(alarmDisableFanoutExchange);
    }

    @Bean
    public Binding bindingAlarmDisableQueue_2(Queue alarmDisableQueue2, FanoutExchange alarmDisableFanoutExchange) {
        return BindingBuilder.bind(alarmDisableQueue2).to(alarmDisableFanoutExchange);
    }

}
