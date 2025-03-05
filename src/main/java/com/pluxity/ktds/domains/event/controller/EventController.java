package com.pluxity.ktds.domains.event.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.pluxity.ktds.domains.event.service.EventEmitterService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class EventController {

    @CrossOrigin("*")
    @GetMapping(value = "/events/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() ->  {
            EventEmitterService.removeEmitter(emitter);
        });
        
        emitter.onTimeout(() ->  {
            EventEmitterService.removeEmitter(emitter);
        });

        emitter.onError((e) -> {
            EventEmitterService.removeEmitter(emitter);
        });

        EventEmitterService.addEmitter(emitter);

        return emitter;
    }



}
