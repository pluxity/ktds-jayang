package com.pluxity.ktds.domains.sop.service;

import com.pluxity.ktds.domains.sop.dto.CreateSopDTO;
import com.pluxity.ktds.domains.sop.entity.Sop;
import com.pluxity.ktds.domains.sop.repository.SopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SopService {

    private final SopRepository sopRepository;

    @Transactional
    public void save(CreateSopDTO createSopDTO) {
        Sop sop = Sop.builder()
                .sopCategory(createSopDTO.sopCategory())
                .sopName(createSopDTO.sopName())
                .mainManagerDivision(createSopDTO.mainManagerDivision())
                .mainManagerName(createSopDTO.mainManagerName())
                .mainManagerContact(createSopDTO.mainManagerContact())
                .subManagerDivision(createSopDTO.subManagerDivision())
                .subManagerName(createSopDTO.subManagerName())
                .subManagerContact(createSopDTO.subManagerContact())
                .build();
    }
}
