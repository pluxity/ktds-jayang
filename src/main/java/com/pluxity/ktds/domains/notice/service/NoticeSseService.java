package com.pluxity.ktds.domains.notice.service;

import com.pluxity.ktds.domains.notice.entity.Notice;
import com.pluxity.ktds.global.exception.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NoticeSseService {

    private final Logger log = LoggerFactory.getLogger(NoticeSseService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    public void sendNotice(Notice notice) {
        log.info("Sending notice to {} subscribers: {}", emitters.size(), notice);
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notice")
                        .data(notice));
            } catch (IOException e) {
                log.error("Error sending notice via SSE", e);
                throw new RuntimeException(e.getMessage());
            }
        }
    }
}
