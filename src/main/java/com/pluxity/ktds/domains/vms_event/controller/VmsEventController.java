package com.pluxity.ktds.domains.vms_event.controller;

import com.pluxity.ktds.domains.event.service.EventEmitterService;
import com.pluxity.ktds.domains.vms_event.dto.VmsEventDto;
import com.pluxity.ktds.domains.vms_event.service.VmsEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vms-event")
public class VmsEventController {

    private final VmsEventService vmsEventService;
    private final EventEmitterService eventEmitterService;

    @GetMapping(path = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return eventEmitterService.createEmitter();
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.OK)
    public void receiveEvent(@RequestBody VmsEventDto dto) {
        vmsEventService.save(dto);
        eventEmitterService.sendEvent("vmsEvent", dto);
    }
}
