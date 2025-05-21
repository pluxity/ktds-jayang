package com.pluxity.ktds.domains.management.service;

import com.pluxity.ktds.domains.management.dto.CreateVendorDTO;
import com.pluxity.ktds.domains.management.dto.UpdateVendorDTO;
import com.pluxity.ktds.domains.management.dto.VendorResponseDTO;
import com.pluxity.ktds.domains.management.entity.Vendor;
import com.pluxity.ktds.domains.management.repository.VendorRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    @Transactional
    public void save(CreateVendorDTO createVendorDTO) {
        Vendor vendor = Vendor.builder()
                .vendorName(createVendorDTO.vendorName())
                .representativeName(createVendorDTO.representativeName())
                .businessNumber(createVendorDTO.businessNumber())
                .contactNumber(createVendorDTO.contactNumber())
                .description(createVendorDTO.description())
                .modifier(createVendorDTO.modifier())
                .build();
        vendorRepository.save(vendor);
    }

    @Transactional(readOnly = true)
    public List<VendorResponseDTO> findAll() {
        return vendorRepository.findAll().stream()
                .map(Vendor::toResponseDTO)
                .toList();
    }

    @Transactional
    public void updateVendor(Long id, UpdateVendorDTO dto) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));
        vendor.updateVendor(dto.vendorName(), dto.representativeName(), dto.businessNumber(), dto.contactNumber(), dto.description(), dto.modifier());
    }

    @Transactional
    public VendorResponseDTO findById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        return vendor.toResponseDTO();
    }

    @Transactional
    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllById(@NotNull List<Long> ids) {
        vendorRepository.deleteAllById(ids);
    }
}
