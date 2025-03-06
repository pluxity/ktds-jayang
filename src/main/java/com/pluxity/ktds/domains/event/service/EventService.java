package com.pluxity.ktds.domains.event.service;

import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

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
}
