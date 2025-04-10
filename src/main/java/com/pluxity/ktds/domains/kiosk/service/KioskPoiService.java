package com.pluxity.ktds.domains.kiosk.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.kiosk.dto.*;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.domains.kiosk.entity.Banner;
import com.pluxity.ktds.domains.kiosk.entity.KioskPoi;
import com.pluxity.ktds.domains.kiosk.repository.KioskPoiRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static com.pluxity.ktds.global.constant.ErrorCode.*;


@Service
@RequiredArgsConstructor
public class KioskPoiService {

    private final SaveImage imageStrategy;
    private final FileInfoService fileIoService;
    private final KioskPoiRepository kioskPoiRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final FileInfoRepository fileInfoRepository;

    private KioskPoi getKioskPoi(Long id) {
        return kioskPoiRepository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_POI));
    }

    @Transactional(readOnly = true)
    public Object findKioskPoiById(Long id) {

        KioskPoi kioskPoi = getKioskPoi(id);

        if (kioskPoi.isKiosk()) {
            return kioskPoi.toKioskDetailResponseDTO();
        } else {
            return kioskPoi.toStoreDetailResponseDTO();
        }
    }

    @Transactional(readOnly = true)
    public List<KioskAllPoiResponseDTO> findAll() {
        return kioskPoiRepository.findAll().stream()
                .map(KioskPoi::toAllResponseDto)
                .toList();
    }

    @Transactional
    public FileInfoDTO saveFile(@NotNull KioskFileUploadDTO dto) {
        try {
            return fileIoService.saveFile(dto.file(), dto.type(), imageStrategy);
        } catch (IOException e) {
            throw new CustomException(FAILED_SAVE_FILE);
        }
    }

    @Transactional
    public Long saveStorePoi(CreateStorePoiDTO dto) {
        Building building = buildingRepository.findById(dto.buildingId()).orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        Floor floor = floorRepository.findById(dto.floorId()).orElseThrow(() -> new CustomException(NOT_FOUND_FLOOR));

        FileInfo logo = null;
        if (dto.fileInfoId() != null) {
            logo = fileInfoRepository.findById(dto.fileInfoId()).orElseThrow(() -> new CustomException(NOT_FOUND_FILE));
        }

        KioskPoi kioskPoi = KioskPoi.builder().name(dto.name()).phoneNumber(dto.phoneNumber()).category(dto.category()).isKiosk(dto.isKiosk()).build();

        // 연관관계 설정
        kioskPoi.changeBuilding(building);
        kioskPoi.changeFloor(floor);
        kioskPoi.changeLogo(logo);

        // 배너 추가
        if (dto.banners() != null) {
            for (CreateBannerDTO bannerDTO : dto.banners()) {
                FileInfo bannerFile = fileInfoRepository.findById(bannerDTO.fileId()).orElseThrow(() -> new CustomException(NOT_FOUND_FILE));

                Banner banner = Banner.builder().image(bannerFile).priority(bannerDTO.priority()).startDate(bannerDTO.startDate()).endDate(bannerDTO.endDate()).build();

                kioskPoi.addBanner(banner);
            }
        }

        return kioskPoiRepository.save(kioskPoi).getId();
    }

    @Transactional
    public Long saveKioskPoi(CreateKioskPoiDTO dto) {
        Building building = buildingRepository.findById(dto.buildingId()).orElseThrow(() -> new CustomException(NOT_FOUND_BUILDING));

        Floor floor = floorRepository.findById(dto.floorId()).orElseThrow(() -> new CustomException(NOT_FOUND_FLOOR));

        KioskPoi kioskPoi = KioskPoi.builder().name(dto.name()).kioskCode(dto.kioskCode()).description(dto.description()).isKiosk(dto.isKiosk()).build();

        // 연관관계 설정
        kioskPoi.changeBuilding(building);
        kioskPoi.changeFloor(floor);

        return kioskPoiRepository.save(kioskPoi).getId();
    }

    @Transactional
    public void updateStore(@Valid @NotNull final Long id, @NotNull final UpdateStorePoiDTO dto) {
        KioskPoi kioskPoi = getKioskPoi(id);
        kioskPoi.clearBanners();

        kioskPoi.storePoiUpdate(dto.name(), dto.category(), dto.phoneNumber());

        updateIfNotNull(dto.floorId(), kioskPoi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
        updateIfNotNull(dto.buildingId(), kioskPoi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.fileInfoId(), kioskPoi::changeLogo, fileInfoRepository, ErrorCode.NOT_FOUND_FILE);
        dto.banners().forEach(bannerDTO -> {
            FileInfo bannerFile = fileInfoRepository.findById(bannerDTO.fileId()).orElseThrow(() -> new CustomException(NOT_FOUND_FILE));
            Banner banner = Banner.builder().image(bannerFile).priority(bannerDTO.priority()).startDate(bannerDTO.startDate()).endDate(bannerDTO.endDate()).build();
            kioskPoi.addBanner(banner);
        });
    }

    @Transactional
    public void updateKiosk(@NotNull final Long id, @NotNull final UpdateKioskPoiDTO dto) {
        KioskPoi kioskPoi = getKioskPoi(id);

        kioskPoi.kioskPoiUpdate(dto.name(), dto.kioskCode(), dto.description());

        updateIfNotNull(dto.floorId(), kioskPoi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
    }

    private <T, ID> void updateIfNotNull(final ID id, final Consumer<T> setter, final JpaRepository<T, ID> repository, final ErrorCode errorCode) {
        if (id != null) {
            Optional<T> optionalEntity = repository.findById(id);
            T entity = optionalEntity.orElseThrow(() -> new CustomException(errorCode));
            setter.accept(entity);
        }
    }

    @Transactional
    public void updatePosition(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, kioskPoi -> kioskPoi.changePosition(dto));
    }

    @Transactional
    public void updateRotation(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, kioskPoi -> kioskPoi.changeRotation(dto));
    }

    @Transactional
    public void updateScale(@NotNull final Long id, @NotNull final Spatial dto) {
        updateSpatial(id, kioskPoi -> kioskPoi.changeScale(dto));
    }

    private void updateSpatial(Long id, Consumer<KioskPoi> updateMethod) {
        KioskPoi kioskPoi = getKioskPoi(id);
        updateMethod.accept(kioskPoi);
    }

    @Transactional
    public void delete(@NotNull final Long id) {
        KioskPoi kioskPoi = getKioskPoi(id);
        kioskPoiRepository.delete(kioskPoi);
    }


}
