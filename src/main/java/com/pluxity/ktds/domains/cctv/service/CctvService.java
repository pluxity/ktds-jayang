package com.pluxity.ktds.domains.cctv.service;

import com.pluxity.ktds.domains.cctv.dto.CreateCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.Cctv;
import com.pluxity.ktds.domains.cctv.repository.CctvRepository;
import com.pluxity.ktds.global.exception.CustomException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import static com.pluxity.ktds.global.constant.ErrorCode.INVALID_REQUEST;

@Service
public class CctvService {

    private final CctvRepository repository;

    public CctvService(CctvRepository repository) {
        this.repository = repository;
    }

    public void saveCctv(CreateCctvDTO dto) {

        Cctv cctv = CreateCctvDTO.toEntity(dto);

        try {
            repository.save(cctv);
        } catch (DataIntegrityViolationException e) {
            throw new CustomException(INVALID_REQUEST, e.getMessage());
        }

    }

}
