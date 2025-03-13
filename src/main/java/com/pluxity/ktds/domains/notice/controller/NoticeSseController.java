package com.pluxity.ktds.domains.notice.controller;

import com.pluxity.ktds.domains.notice.service.NoticeSseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
public class NoticeSseController {

    private final NoticeSseService noticeSseService;

    @GetMapping("/sse/notice")
    public SseEmitter subscribeToNotice() {
        return noticeSseService.subscribe();
    }
}
