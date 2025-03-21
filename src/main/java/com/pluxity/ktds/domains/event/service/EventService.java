package com.pluxity.ktds.domains.event.service;

import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import com.pluxity.ktds.global.client.PollingClientService;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.INVALID_REQUEST;
import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_EVENT_DATA;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final TagClientService tagClientService;
//    private final PollingClientService pollingClientService;
    private final AlarmDisablePublisher alarmDisablePublisher;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public List<AlarmResponseDTO> findUnDisableAlarms() {
        return eventRepository.findUnDisableAlarms()
        .stream()
                .map(this::toDto)
                .toList();
    }

    private AlarmResponseDTO toDto(Alarm alarm) {
        return AlarmResponseDTO.builder()
                .id(alarm.getId())
                .deviceCd(alarm.getDeviceCd())
                .deviceNm(alarm.getDeviceNm())
                .buildingNm(alarm.getBuildingNm())
                .floorNm(alarm.getFloorNm())
                .alarmType(alarm.getAlarmType().getStatus())
                .process(alarm.getProcess())
                .tagName(alarm.getTagName())
                .occurrenceDate(alarm.getOccurrenceDate())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Last7DaysProcessCountDTO> findProcessCountsForLast7Days() {
        LocalDateTime sevenDays = LocalDateTime.now().minusDays(7);
        return eventRepository.findProcessCountsForLast7Days(sevenDays);
    }

    @Transactional(readOnly = true)
    public List<Last7DaysDateCountDTO> findDateCountsForLast7Days() {
        LocalDateTime sevenDays = LocalDateTime.now().minusDays(7);
        return eventRepository.findDateCountsForLast7Days(sevenDays);
    }

    @Transactional(readOnly = true)
    public List<Last24HoursEventDTO> findLatest24HoursEventList() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        return eventRepository.findLatest24HoursEventList(last24Hours);
    }

    @Transactional
    public Long disableAlarm(Long id){
        Alarm alarm = eventRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_EVENT_DATA));

        if(alarm.getConfirmTime() == null){
            try{
                tagClientService.acknowledgeAlarm(List.of(alarm.getTagName()));
                alarm.updateConfirmTime(LocalDateTime.now());
                eventRepository.save(alarm);
                // polling server로 id 전송용
                // pollingClientService.eventDisable(id);

                // rabbitmq로 id 전송용
                alarmDisablePublisher.publishAlarmDisable(id);
            }catch(Exception e){
                log.error("알람 해제 실패: {}", e.getMessage(), e);
                throw new CustomException(INVALID_REQUEST, e.getMessage());
            }
        }
        return id;
    }


    public List<Alarm> getAlarmsWithinDateRangeAndBuildingFloor(
            String startDateString, String endDateString, String buildingNm, String floorNm, String deviceType, String alarmType) {
        LocalDateTime startDate = LocalDate.parse(startDateString, dateFormatter).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateString, dateFormatter).atTime(23, 59, 59);

        if (buildingNm == null && floorNm == null) {
            return eventRepository.findByOccurrenceDateBetween(startDate, endDate);
        } else if (buildingNm != null && floorNm == null) {
            return eventRepository.findByOccurrenceDateBetweenAndBuildingNm(startDate, endDate, buildingNm);
        } else if (buildingNm != null && floorNm != null) {
            return eventRepository.findByOccurrenceDateBetweenAndBuildingNmAndFloorNm(startDate, endDate, buildingNm, floorNm);
        } else {
            return eventRepository.findByOccurrenceDateBetweenAndFloorNm(startDate, endDate, floorNm);
        }
    }

    public List<Alarm> getAlarms(String startDateString, String endDateString,
                                 String buildingNm, String floorNm,
                                 String deviceType, String alarmType) {
        LocalDateTime startDate = LocalDate.parse(startDateString, dateFormatter).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateString, dateFormatter).atTime(23, 59, 59);

        List<Alarm> alarms = eventRepository.findByOccurrenceDateBetween(startDate, endDate);

        if (buildingNm != null && !buildingNm.isEmpty()) {
            alarms = alarms.stream()
                    .filter(alarm -> buildingNm.equals(alarm.getBuildingNm()))
                    .toList();
        }
        if (floorNm != null && !floorNm.isEmpty()) {
            alarms = alarms.stream()
                    .filter(alarm -> floorNm.equals(alarm.getFloorNm()))
                    .collect(Collectors.toList());
        }
        if (deviceType != null && !deviceType.isEmpty()) {
            alarms = alarms.stream()
                    .filter(alarm -> alarm.getDeviceNm() != null && alarm.getDeviceNm().startsWith(deviceType + "-"))
                    .collect(Collectors.toList());
        }
        if (alarmType != null && !alarmType.isEmpty()) {
            try {
                AlarmStatus status = AlarmStatus.valueOf(alarmType.toUpperCase());
                alarms = alarms.stream()
                        .filter(alarm -> status.equals(alarm.getAlarmType()))
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {

                alarms = new ArrayList<>();
            }
        }
        return alarms;
    }
}
