package com.pluxity.ktds.domains.event.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.pluxity.ktds.domains.event.service.EventEmitterService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Slf4j
public class EventPollingController {

    private final EventEmitterService eventEmitterService; // 의존성 주입

    @CrossOrigin("*")
    @GetMapping(value = "/events/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return eventEmitterService.createEmitter();
    }
}
