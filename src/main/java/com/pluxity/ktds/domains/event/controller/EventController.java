package com.pluxity.ktds.domains.event.controller;

import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.service.EventService;
import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    @GetMapping("/process-counts")
    public DataResponseBody<List<Last7DaysProcessCountDTO>> getProcessCountsForLast7Days() {
        return DataResponseBody.of(eventService.findProcessCountsForLast7Days());
    }

    @GetMapping("/date-counts")
    public DataResponseBody<List<Last7DaysDateCountDTO>> getDateCountsForLast7Days() {
        return DataResponseBody.of(eventService.findDateCountsForLast7Days());
    }

    @GetMapping("/latest-24-hours")
    public DataResponseBody<List<Last24HoursEventDTO>> getLatest24HoursEventList() {
        return DataResponseBody.of(eventService.findLatest24HoursEventList());
    }

}
