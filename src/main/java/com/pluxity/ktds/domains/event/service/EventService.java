package com.pluxity.ktds.domains.event.service;

import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.event.constant.DeviceType;
import com.pluxity.ktds.domains.event.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final PoiRepository poiRepository;

    @Transactional(readOnly = true)
    public AlarmResponseDTO findUnDisableAlarms() {
        return eventRepository.findUnDisableAlarms().toResponseDTO();
    }

    @Transactional(readOnly = true)
    public List<Last7DaysProcessCountDTO> findProcessCountsForLast7Days() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6); // 오늘 포함 7일
        
        LocalDateTime startDate = sevenDaysAgo.atStartOfDay();
        LocalDateTime endDate = today.atTime(LocalTime.MAX); // 23:59:59.999999999
        
        log.info("유형별 통계 : {} ~ {}", startDate, endDate);
        return eventRepository.findProcessCountsForLast7Days(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<Last7DaysDateCountDTO> findDateCountsForLast7Days() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6); // 오늘 포함 7일
        
        LocalDateTime startDate = sevenDaysAgo.atStartOfDay();
        LocalDateTime endDate = today.atTime(LocalTime.MAX); // 23:59:59.999999999
        
        log.info("일자별 통계 : {} ~ {}", startDate, endDate);
        return eventRepository.findDateCountsForLast7Days(startDate, endDate);
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
                    .filter(alarm -> alarm.getDeviceNm() != null && alarm.getDeviceNm().startsWith(deviceType))
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

    public List<AlarmResponseDTO> getAlarmList(String startDateString, String endDateString,
                                 String buildingNm, String floorNm,
                                 String deviceType, String searchValue) {

        LocalDateTime startDate = LocalDate.parse(startDateString, dateFormatter).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateString, dateFormatter).atTime(23, 59, 59);

        buildingNm = (buildingNm != null && !buildingNm.isEmpty()) ? buildingNm : null;
        floorNm = (floorNm != null && !floorNm.isEmpty()) ? floorNm : null;
        String equipment = null;
        if (deviceType != null && !deviceType.isEmpty()) {
            String code = DeviceType.getCodeByDescription(deviceType);
            equipment = (code != null) ? code : deviceType;
        }

        log.info("deviceType(original): {}, equipment(converted): {}", deviceType, equipment);

        searchValue = (searchValue != null && !searchValue.isEmpty()) ? searchValue : null;
//        String finalSearchValue = (searchValue != null && !searchValue.isEmpty()) ? searchValue : null;

        if (searchValue != null) {

            AlarmStatus status = AlarmStatus.fromLabel(searchValue);
            if (status != null) {
                searchValue = status.name();
            }
        }

        return eventRepository.findAlarms(startDate, endDate, buildingNm, floorNm, equipment, searchValue).stream()
                .map(Alarm::toResponseDTO)
                .toList();
    }
}
