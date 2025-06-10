package com.pluxity.ktds.domains.vms_event.service;

import com.pluxity.ktds.domains.vms_event.dto.VmsEventDto;
import com.pluxity.ktds.domains.vms_event.entity.VmsEvent;
import com.pluxity.ktds.domains.vms_event.repository.VmsEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VmsEventService {

    private final VmsEventRepository vmsEventRepository;

    @Transactional
    public void save(VmsEventDto dto) {
        VmsEvent vmsEvent = dto.toEntity();
        vmsEventRepository.save(vmsEvent);
    }
}
