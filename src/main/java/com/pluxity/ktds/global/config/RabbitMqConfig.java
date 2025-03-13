package com.pluxity.ktds.global.config;

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
public class RabbitMqConfig {
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
    public Queue was1AlarmQueue() {
        return new Queue(was1AlarmQueueName, true);
    }
    @Bean
    public Queue was2AlarmQueue() {
        return new Queue(was2AlarmQueueName, true);
    }

    @Bean
    public FanoutExchange alarmExchange() {
        return new FanoutExchange(alarmExchangeName, true, false);
    }

    @Bean
    public Binding was1AlarmBinding(Queue was1AlarmQueue, FanoutExchange alarmExchange) {
        return BindingBuilder.bind(was1AlarmQueue).to(alarmExchange);
    }
    @Bean
    public Binding was2AlarmBinding(Queue was2AlarmQueue, FanoutExchange alarmExchange) {
        return BindingBuilder.bind(was2AlarmQueue).to(alarmExchange);
    }

    @Bean
    public Queue was1NoticeQueue() {
        return new Queue(was1NoticeQueueName, true);
    }
    @Bean
    public Queue was2NoticeQueue() {
        return new Queue(was2NoticeQueueName, true);
    }

    @Bean
    public FanoutExchange noticeExchange() {
        return new FanoutExchange(noticeExchangeName, true, false);
    }

    @Bean
    public Binding was1NoticeBinding(Queue was1NoticeQueue, FanoutExchange noticeExchange) {
        return BindingBuilder.bind(was1NoticeQueue).to(noticeExchange);
    }
    @Bean
    public Binding was2NoticeBinding(Queue was2NoticeQueue, FanoutExchange noticeExchange) {
        return BindingBuilder.bind(was2NoticeQueue).to(noticeExchange);
    }

    @Bean
    public RabbitAdmin amqpAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }
}
