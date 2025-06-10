package com.pluxity.ktds.domains.event.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class EventEmitterService {
    private static final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onError(e -> removeEmitter(emitter));

        emitters.add(emitter);
        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
    }

    public void sendEvent(String eventName, Object event) {

        emitters.forEach(emitter -> {
                log.info("send emitter : {}",emitter);
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(event));
            } catch (IOException e) {
                removeEmitter(emitter);
            }
        });
    }
}
