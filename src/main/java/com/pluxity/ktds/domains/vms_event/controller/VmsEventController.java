package com.pluxity.ktds.domains.vms_event.controller;

import com.pluxity.ktds.domains.vms_event.dto.VmsEventDto;
import com.pluxity.ktds.domains.vms_event.service.VmsEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vms-event")
public class VmsEventController {

    private final VmsEventService vmsEventService;

    @PostMapping()
    @ResponseStatus(HttpStatus.OK)
    public void receiveEvent(@RequestBody VmsEventDto dto) {
        vmsEventService.save(dto);
    }
}
