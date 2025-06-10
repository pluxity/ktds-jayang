package com.pluxity.ktds.domains.management.service;

import com.pluxity.ktds.domains.management.dto.CreateMaintenanceDTO;
import com.pluxity.ktds.domains.management.dto.MaintenanceResponseDTO;
import com.pluxity.ktds.domains.management.dto.UpdateMaintenanceDTO;
import com.pluxity.ktds.domains.management.dto.VendorResponseDTO;
import com.pluxity.ktds.domains.management.entity.Maintenance;
import com.pluxity.ktds.domains.management.entity.Vendor;
import com.pluxity.ktds.domains.management.repository.MaintenanceRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    @Transactional
    public void save(CreateMaintenanceDTO maintenanceDTO) {
        Maintenance maintenance = Maintenance.builder()
                .maintenanceName(maintenanceDTO.maintenanceName())
                .managementCategory(maintenanceDTO.managementCategory())
                .mainManagerDivision(maintenanceDTO.mainManagerDivision())
                .mainManagerName(maintenanceDTO.mainManagerName())
                .mainManagerContact(maintenanceDTO.mainManagerContact())
                .subManagerDivision(maintenanceDTO.subManagerDivision())
                .subManagerName(maintenanceDTO.subManagerName())
                .subManagerContact(maintenanceDTO.subManagerContact())
                .modifier(maintenanceDTO.modifier())
                .build();
        maintenanceRepository.save(maintenance);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponseDTO> findAll() {
        return maintenanceRepository.findAll().stream()
                .map(Maintenance::toResponseDTO)
                .toList();
    }

    @Transactional
    public MaintenanceResponseDTO findById(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));

        return maintenance.toResponseDTO();
    }

    @Transactional
    public void updateMaintenance(Long id, UpdateMaintenanceDTO dto) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ID));
        maintenance.updateMaintenance(dto.managementCategory(), dto.maintenanceName(), dto.mainManagerDivision(), dto.mainManagerName(), dto.mainManagerContact(), dto.subManagerDivision(), dto.subManagerName(), dto.subManagerContact(), dto.modifier());

    }

    @Transactional
    public void deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
    }

    @Transactional
    public void deleteMaintenanceAllById(@NotNull List<Long> ids) {
        maintenanceRepository.deleteAllById(ids);
    }
}
