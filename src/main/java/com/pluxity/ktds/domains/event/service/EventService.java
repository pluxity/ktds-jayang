package com.pluxity.ktds.domains.event.service;

import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.global.client.PollingClientService;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
}
