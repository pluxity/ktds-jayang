package com.pluxity.ktds.domains.event.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.pluxity.ktds.domains.event.service.EventEmitterService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/events")
@Slf4j
public class EventPollingController {

    private final EventEmitterService eventEmitterService;

    @CrossOrigin("*")
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(HttpServletRequest request) {
        log.info("=== SSE 구독 요청 시작 ===");

        String clientId = request.getSession().getId();
        log.info("클라이언트 ID(세션) : {}", clientId);
        try {
            SseEmitter emitter = eventEmitterService.createEmitter(clientId);
            log.info("SSE Emitter 생성 완료: {}", emitter);
            log.info("=== SSE 구독 요청 성공 ===");
            return emitter;
        } catch (Exception e) {
            log.error("SSE Emitter 생성 실패: {}", e.getMessage(), e);
            throw e;
        }
    }
}