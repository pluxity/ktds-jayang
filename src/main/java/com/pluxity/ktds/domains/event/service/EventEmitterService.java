package com.pluxity.ktds.domains.event.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


import java.util.List;
import java.util.ArrayList;
import java.io.IOException;

@Slf4j
@Service
public class EventEmitterService {
    
    private static final List<SseEmitter> emitters = new ArrayList<>();

    public static void addEmitter(SseEmitter emitter) {
        emitters.add(emitter);
    }

    public static void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
    }

    public void sendEvent(String eventName, Object event) {
        log.info("Send Event: {}", event);
        List<SseEmitter> deadEmitters = new ArrayList<>();

        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                .name(eventName)
                .data(event));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        });

        emitters.removeAll(deadEmitters);
    }

    public static int getEmitterCount() {
        return emitters.size();
    }

}

