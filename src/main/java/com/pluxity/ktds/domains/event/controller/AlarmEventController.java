package com.pluxity.ktds.domains.event.controller;

import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import com.pluxity.ktds.domains.event.service.EventService;
import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/events")
public class AlarmEventController {

    private final EventService eventService;

    @GetMapping("/unconfirmed")
    public DataResponseBody<AlarmResponseDTO> getUnDisableAlarms(){
        return DataResponseBody.of(eventService.findUnDisableAlarms());
    }

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

    @PatchMapping("/disable/{id}")
    public DataResponseBody<Long> disableAlarm(@PathVariable Long id){
        Long disableAlarmId = eventService.disableAlarm(id);
        return DataResponseBody.of(disableAlarmId);
            
    }

    @GetMapping("/alarms")
    public DataResponseBody<List<AlarmResponseDTO>> getAlarmList(
            @RequestParam String startDateString,
            @RequestParam String endDateString,
            @RequestParam(required = false) String buildingNm,
            @RequestParam(required = false) String floorNm,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String searchValue) {

        List<AlarmResponseDTO> alarms = eventService.getAlarmList(startDateString, endDateString,
                buildingNm, floorNm, deviceType, searchValue);
        return DataResponseBody.of(alarms);
    }
}
