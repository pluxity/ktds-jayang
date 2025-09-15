package com.pluxity.ktds.domains.sop.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveStrategy;
import com.pluxity.ktds.domains.sop.dto.CreateSopDTO;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import com.pluxity.ktds.domains.sop.dto.UpdateSopDTO;
import com.pluxity.ktds.domains.sop.entity.Sop;
import com.pluxity.ktds.domains.sop.repository.SopRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class SopService {

    private final SopRepository sopRepository;
    private final FileInfoService fileInfoService;

    @Transactional
    public void save(CreateSopDTO createSopDTO) {
        Sop sop = Sop.builder()
                .sopName(createSopDTO.sopName())
                .mainManagerDivision(createSopDTO.mainManagerDivision())
                .mainManagerName(createSopDTO.mainManagerName())
                .mainManagerContact(createSopDTO.mainManagerContact())
                .subManagerDivision(createSopDTO.subManagerDivision())
                .subManagerName(createSopDTO.subManagerName())
                .subManagerContact(createSopDTO.subManagerContact())
                .build();

        updateImage(createSopDTO.sopFileId(), sop::updateSopFile);

        sopRepository.save(sop);
    }

    @Transactional(readOnly = true)
    public List<SopResponseDTO> findAll() {
        return sopRepository.findAll().stream()
                .map(Sop::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SopResponseDTO findById(Long id) {
        Sop sop = sopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found Sop"));
        return sop.toResponseDTO();
    }

    @Transactional
    public void updateSop(Long id, UpdateSopDTO updateSopDTO) {
        Sop sop = sopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found Sop"));
        sop.updateSop(updateSopDTO);
        updateImage(updateSopDTO.sopFileId(), sop::updateSopFile);
    }

    @Transactional(readOnly = true)
    public SopResponseDTO findFirstByOrderByIdDesc() {
        Sop sop = sopRepository.findFirstByOrderByIdDesc()
                .orElseThrow(() -> new RuntimeException("Not found Sop"));
        return sop.toResponseDTO();
    }

    @Transactional
    public void deleteSop(Long id) {
        sopRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllSop(@NotNull List<Long> ids) {
        sopRepository.deleteAllById(ids);
    }

    @Transactional
    public FileInfoDTO saveFile(@NotNull MultipartFile file,
                                @NotNull FileEntityType type,
                                @NotNull SaveStrategy strategy) throws IOException {
        return fileInfoService.saveFile(file, type, strategy);
    }

    private void updateImage(Long iconFileId, Consumer<FileInfo> updater) {
        if (iconFileId != null) {
            FileInfo fileInfo = fileInfoService.findById(iconFileId);
            updater.accept(fileInfo);
        }
    }
}
