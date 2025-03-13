package com.pluxity.ktds.domains.notice.listener;

import com.pluxity.ktds.domains.notice.entity.Notice;
import com.pluxity.ktds.domains.notice.service.NoticeSseService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NoticeConsumer {
    private final Logger log = LoggerFactory.getLogger(NoticeConsumer.class);

    private final NoticeSseService noticeSseService;

    @RabbitListener(queues = "${rabbitmq.queue.notice-was1}")
    public void receiveNotice(Notice notice) {
        noticeSseService.sendNotice(notice);
        log.debug("Received notice from queue : {}", notice);
    }
}
