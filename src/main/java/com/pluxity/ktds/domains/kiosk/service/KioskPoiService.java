package com.pluxity.ktds.domains.kiosk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.kiosk.dto.*;
import com.pluxity.ktds.domains.kiosk.repository.BannerRepository;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.*;


@Service
@RequiredArgsConstructor
@Slf4j
public class KioskPoiService {

    private final SaveImage imageStrategy;
    private final FileInfoService fileIoService;
    private final KioskPoiRepository kioskPoiRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final FileInfoRepository fileInfoRepository;
    private final BannerRepository bannerRepository;
    private final ObjectMapper objectMapper;

    private KioskPoi getKioskPoi(Long id) {
        return kioskPoiRepository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_POI));
    }

    @Transactional(readOnly = true)
    public JsonNode findKioskPoiById(Long id) {

        KioskPoi kioskPoi = getKioskPoi(id);

        KioskAllPoiResponseDTO allPoiResponseDTO = kioskPoi.toAllResponseDto();
        ObjectNode node = objectMapper.valueToTree(allPoiResponseDTO);

        if (kioskPoi.isKiosk()) {
            node.set("kiosk", objectMapper.valueToTree(kioskPoi.toKioskDetailResponseDTO()));
        } else {
            node.set("store", objectMapper.valueToTree(kioskPoi.toStoreDetailResponseDTO()));
        }

        return node;
    }

    @Transactional(readOnly = true)
    public List<KioskAllPoiResponseDTO> findAll() {
        return kioskPoiRepository.findAllByOrderByIdDesc().stream()
                .map(KioskPoi::toAllResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StorePoiDetailResponseDTO> findStoreDetailList() {
        return kioskPoiRepository.findByIsKioskFalse().stream()
                .map(KioskPoi::toStoreDetailResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAllDetail() {
        List<KioskPoi> kioskPoiList = kioskPoiRepository.findAll();
        List<Map<String, Object>> poiDetailList = new ArrayList<>();

        for (KioskPoi kioskPoi : kioskPoiList) {
            Map<String, Object> map = new HashMap<>();
            KioskAllPoiResponseDTO baseInfo = KioskAllPoiResponseDTO.builder()
                    .id(kioskPoi.getId())
                    .name(kioskPoi.getName())
                    .isKiosk(kioskPoi.isKiosk())
                    .position(kioskPoi.getPosition())
                    .rotation(kioskPoi.getRotation())
                    .scale(kioskPoi.getScale())
                    .buildingId(kioskPoi.getBuilding() != null ? kioskPoi.getBuilding().getId() : null)
                    .floorId(kioskPoi.getFloor() != null ? kioskPoi.getFloor().getId() : null)
                    .build();

            Object detailDto;
            if (kioskPoi.isKiosk()) {
                detailDto = kioskPoi.toKioskDetailResponseDTO();
            } else {
                detailDto = kioskPoi.toStorePoiBasicResponseDTO();
            }

            map.put("common", baseInfo);
            map.put("detail", detailDto);
            poiDetailList.add(map);
        }
        return poiDetailList;
    }

    @Transactional(readOnly = true)
    public KioskPoiDetailResponseDTO findKioskPoiByCode(String code) {
        KioskPoi kioskPoi = kioskPoiRepository.findByKioskCode(code).orElseThrow(() -> new CustomException(NOT_FOUND_POI));
        return kioskPoi.toKioskDetailResponseDTO();
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
    public Long saveStorePoi(CreateStorePoiDTO dto){
        List<FileInfo> savedFiles = new ArrayList<>();

        try{
            // 로고 파일 저장
            if (dto.fileInfoId() != null) {
                FileInfo savedLogoFile = fileInfoRepository.findById(dto.fileInfoId())
                        .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));
                savedFiles.add(savedLogoFile);
            }

            KioskPoi poi = KioskPoi.builder()
                    .name(dto.name())
                    .phoneNumber(dto.phoneNumber())
                    .category(dto.category())
                    .isKiosk(dto.isKiosk())
                    .build();

            updateIfNotNull(dto.buildingId(), poi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
            updateIfNotNull(dto.floorId(), poi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
            updateIfNotNull(dto.fileInfoId(), poi::changeLogo, fileInfoRepository, ErrorCode.NOT_FOUND_FILE);

            try{
                for(CreateBannerDTO bannerDTO : dto.banners()) {

                    FileInfo bannerImage = fileInfoRepository.findById(bannerDTO.fileId())
                            .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));
                    savedFiles.add(bannerImage);

                    Banner banner = Banner.builder()
                            .image(bannerImage)
                            .priority(bannerDTO.priority())
                            .startDate(bannerDTO.startDate())
                            .endDate(bannerDTO.endDate())
                            .isPermanent(bannerDTO.isPermanent())
                            .build();

                    poi.addBanner(banner);
                }
            }catch (Exception e){
                cleanupFiles(savedFiles);
                throw new CustomException(FAILED_SAVE_FILE);
            }

            kioskPoiRepository.save(poi);
            return poi.getId();
        }catch (Exception e){
            cleanupFiles(savedFiles);
            throw new CustomException(FAILED_SAVE_FILE);
        }
    }

    private void cleanupFiles(List<FileInfo> files) {
        for (FileInfo file : files) {
            try {
                fileInfoRepository.deleteById(file.getId());
            } catch (Exception e) {
                log.error("Failed to delete file with ID: {}", file.getId(), e);
                throw new CustomException(FAILED_DELETE_FILE);
            }
        }
    }

    @Transactional
    public void deleteFile(Long fileId){
        fileInfoRepository.deleteById(fileId);
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
    public void updateStore(@Valid @NotNull final Long id,
                            UpdateStorePoiDTO dto) {
        KioskPoi kioskPoi = getKioskPoi(id);
        kioskPoi.storePoiUpdate(dto.name(), dto.category(), dto.phoneNumber());

        updateIfNotNull(dto.buildingId(), kioskPoi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), kioskPoi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);

        if (dto.fileInfoId() != null) {
            FileInfo logoFile = fileIoService.findById(dto.fileInfoId());
            kioskPoi.changeLogo(logoFile);
        } else {
            kioskPoi.removeLogo();
        }
        List<Banner> existingBanners = bannerRepository.findByKioskPoiId(kioskPoi.getId());
        Map<Long, Banner> existingBannerMap = existingBanners.stream()
                .collect(Collectors.toMap(Banner::getId, b -> b));

        for (Banner oldBanner : existingBanners) {
            boolean shouldDelete = dto.banners().stream()
                    .noneMatch(req -> Objects.equals(req.id(), oldBanner.getId()) && req.fileId() != null);
            if (shouldDelete) {
                bannerRepository.delete(oldBanner);
            }
        }

        for (UpdateBannerDTO bannerDTO : dto.banners()) {
            if (bannerDTO.fileId() == null) continue;
            FileInfo bannerFile = fileIoService.findById(bannerDTO.fileId());

            if (bannerDTO.id() != null) {
                Banner target = existingBannerMap.get(bannerDTO.id());
                if (target == null) {
                    throw new CustomException(NOT_FOUND_FILE);
                }

                target.update(bannerFile, bannerDTO.priority(), bannerDTO.startDate(),
                        bannerDTO.endDate(), bannerDTO.isPermanent());
            } else {
                Banner newBanner = Banner.builder()
                        .kioskPoi(kioskPoi)
                        .image(bannerFile)
                        .priority(bannerDTO.priority())
                        .startDate(bannerDTO.startDate())
                        .endDate(bannerDTO.endDate())
                        .isPermanent(bannerDTO.isPermanent())
                        .build();

                bannerRepository.save(newBanner);
            }
        }
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
    public void unAllocationPoi(Long id) {
        Spatial position = Spatial.builder()
                .x(null)
                .y(null)
                .z(null)
                .build();
        updateSpatial(id, poi -> poi.changePosition(position));
    }

    @Transactional
    public void deleteKioskPoi(@NotNull final Long id) {
        KioskPoi kioskPoi = getKioskPoi(id);
        kioskPoiRepository.delete(kioskPoi);
    }


}
