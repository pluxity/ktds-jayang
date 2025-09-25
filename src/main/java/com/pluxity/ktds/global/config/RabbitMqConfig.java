package com.pluxity.ktds.global.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RabbitMqConfig {

    @Value("${rabbitmq.instance}")
    private String wasInstance;

    @Value("${rabbitmq.host}")
    private String rabbitMqHost;
    @Value("${rabbitmq.port}")
    private int rabbitMqPort;
    @Value("${rabbitmq.username}")
    private String rabbitMqUsername;
    @Value("${rabbitmq.password}")
    private String rabbitMqPassword;
    @Value("${rabbitmq.queue.alarm-was1}")
    private String was1AlarmQueueName;
    @Value("${rabbitmq.queue.alarm-was2}")
    private String was2AlarmQueueName;
    @Value("${rabbitmq.exchange.alarm}")
    private String alarmExchangeName;

    @Value("${rabbitmq.queue.notice-was1}")
    private String was1NoticeQueueName;
    @Value("${rabbitmq.queue.notice-was2}")
    private String was2NoticeQueueName;
    @Value("${rabbitmq.exchange.notice}")
    private String noticeExchangeName;

    @Value("${rabbitmq.queue.alarm-disable-was1}")
    private String was1AlarmDisableQueueName;
    @Value("${rabbitmq.queue.alarm-disable-was2}")
    private String was2AlarmDisableQueueName;
    @Value("${rabbitmq.exchange.alarm-disable}")
    private String alarmDisableExchangeName;



    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory(rabbitMqHost, rabbitMqPort);
        connectionFactory.setUsername(rabbitMqUsername);
        connectionFactory.setPassword(rabbitMqPassword);

        return connectionFactory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        rabbitTemplate.setReplyTimeout(5000);

        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public Queue wasAlarmQueue() {
        String queueName = wasInstance.equals("was1") ? was1AlarmQueueName : was2AlarmQueueName;
        log.info("wasAlarmQueue : {}", queueName);
        return new Queue(queueName, true);
    }

    @Bean
    public FanoutExchange alarmExchange() {
        return new FanoutExchange(alarmExchangeName, true, false);
    }

    @Bean
    public Binding wasAlarmBinding(Queue wasAlarmQueue, FanoutExchange alarmExchange) {
        log.info("wasAlarmBinding : {}, alarmExchange : {}", wasAlarmQueue, alarmExchange);
        return BindingBuilder.bind(wasAlarmQueue).to(alarmExchange);
    }

    @Bean
    public Queue wasNoticeQueue() {
        String queueName = wasInstance.equals("was1") ? was1NoticeQueueName : was2NoticeQueueName;
        log.info("wasNoticeQueue : {}", queueName);
        return new Queue(queueName, true);
    }

    @Bean
    public FanoutExchange noticeExchange() {
        return new FanoutExchange(noticeExchangeName, true, false);
    }

    @Bean
    public Binding wasNoticeBinding(Queue wasNoticeQueue, FanoutExchange noticeExchange) {
        return BindingBuilder.bind(wasNoticeQueue).to(noticeExchange);
    }

    @Bean
    public RabbitAdmin amqpAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public Queue wasAlarmDisableQueue() {
        String queueName = wasInstance.equals("was1") ? was1AlarmDisableQueueName : was2AlarmDisableQueueName;
        log.info("wasAlarmDisableQueue : {}", queueName);
        return new Queue(queueName, true);
    }
    @Bean
    public FanoutExchange alarmDisableExchange() {
        return new FanoutExchange(alarmDisableExchangeName, true, false);
    }
    @Bean
    public Binding was1AlarmDisableBinding(Queue wasAlarmDisableQueue, FanoutExchange alarmDisableExchange) {
        log.info("was1AlarmDisableBinding : {}, alarmDisableExchange : {}", wasAlarmDisableQueue, alarmDisableExchange);
        return BindingBuilder.bind(wasAlarmDisableQueue).to(alarmDisableExchange);
    }
}
