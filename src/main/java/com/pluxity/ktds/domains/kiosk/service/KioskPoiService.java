package com.pluxity.ktds.domains.kiosk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pluxity.ktds.domains.building.dto.CreatePoiDTO;
import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.kiosk.dto.*;
import com.pluxity.ktds.domains.kiosk.entity.KioskCategory;
import com.pluxity.ktds.domains.kiosk.repository.BannerRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.domains.kiosk.entity.Banner;
import com.pluxity.ktds.domains.kiosk.entity.KioskPoi;
import com.pluxity.ktds.domains.kiosk.repository.KioskPoiRepository;
import com.pluxity.ktds.global.utils.ExcelUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.*;
import static com.pluxity.ktds.global.constant.ExcelHeaderNameCode.*;


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

    @Transactional
    public void batchRegisterKioskPoi(Long floorId, Boolean isKiosk, MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            String ext = fileName.substring(fileName.lastIndexOf(".") + 1);

            if (!ext.equals("xlsx") && !ext.equals("xls") && !ext.equals("csv")) {
                throw new CustomException(ErrorCode.INVALID_FILE);
            }

            int kioskFlag = isKiosk ? 1 : 0;
            List<Map<String, Object>> rows = ExcelUtil.readExcelBatchKiosk(file, kioskFlag);

            int headerLength = rows.get(0).size();

            List<KioskPoi> result = new ArrayList<>();

            Floor floor = floorRepository.findById(floorId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_FLOOR));
            for(int i = 1; i < rows.size(); i++) {
                Map<String, String> kioskPoiMap = createMapByRows(rows, headerLength, i);
                kioskPoiRepository.findByName(kioskPoiMap.get("POI명"))
                        .ifPresent(found -> {
                            throw new CustomException(ErrorCode.DUPLICATE_NAME, "Duplicate Poi Name : " + kioskPoiMap.get("POI명"));
                        });

                if (isKiosk) {
                    CreateKioskPoiDTO kioskPoiDTO = CreateKioskPoiDTO.builder()
                            .isKiosk(true)
                            .name(kioskPoiMap.get("POI명"))
                            .kioskCode(kioskPoiMap.get("장비코드"))
                            .floorId(floor.getId())
                            .description(kioskPoiMap.get("비고"))
                            .build();

                    KioskPoi kioskPoi = KioskPoi.builder()
                            .isKiosk(true)
                            .name(kioskPoiMap.get("POI명"))
                            .kioskCode(kioskPoiMap.get("장비코드"))
                            .description(kioskPoiMap.get("비고"))
                            .build();

                    updateIfNotNull(kioskPoiDTO.buildingId(), kioskPoi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
                    updateIfNotNull(kioskPoiDTO.floorId(), kioskPoi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);

                    result.add(kioskPoi);
                } else {
                    CreateStorePoiDTO storePoiDTO = CreateStorePoiDTO.builder()
                            .isKiosk(false)
                            .name(kioskPoiMap.get("POI명"))
                            .floorId(floor.getId())
                            .buildingId(floor.getBuilding().getId())
                            .phoneNumber(kioskPoiMap.get("전화번호"))
                            .category(KioskCategory.fromValue(kioskPoiMap.get("업종")))
                            .build();

                    KioskPoi kioskPoi = KioskPoi.builder()
                            .isKiosk(false)
                            .name(kioskPoiMap.get("POI명"))
                            .phoneNumber(kioskPoiMap.get("전화번호"))
                            .category(KioskCategory.fromValue(kioskPoiMap.get("업종")))
                            .build();


                    changeField(storePoiDTO, kioskPoi);

                    result.add(kioskPoi);
                }
            }

            try {
                kioskPoiRepository.saveAll(result);
            } catch(InvalidDataAccessResourceUsageException | DataIntegrityViolationException e) {
                if(e.getRootCause().getMessage().contains("Data too long for column")) {
                    String errorMessage = e.getRootCause().getMessage();

                    Pattern pattern = Pattern.compile("'(.*?)'");
                    Matcher matcher = pattern.matcher(errorMessage);

                    if (matcher.find()) {
                        String columnName = matcher.group(1);
                        throw new CustomException(ErrorCode.TOO_LONG_EXCEL_FIELD, columnName);
                    } else {
                        throw new CustomException(ErrorCode.TOO_LONG_EXCEL_FIELD);
                    }
                }

                throw new CustomException(FAILED_BATCH_REGISTER_POI);
            }

        } catch(IOException e) {
            throw new CustomException(ErrorCode.FAILED_BATCH_REGISTER_POI);
        }
    }

    @NotNull
    private Map<String, String> createMapByRows(List<Map<String, Object>> rows, int headerLength, int i) {
        Map<String, String> workMap = new HashMap<>();
        for(int j = 0; j < headerLength; j++) {
            String o = String.valueOf(rows.get(i).get(String.valueOf(j)));
            workMap.put(String.valueOf(rows.get(0).get(String.valueOf(j))), o);
        }
        return workMap;
    }

    private void changeField(CreateStorePoiDTO dto, KioskPoi kioskPoi) {
        updateIfNotNull(dto.buildingId(), kioskPoi::changeBuilding, buildingRepository, ErrorCode.NOT_FOUND_BUILDING);
        updateIfNotNull(dto.floorId(), kioskPoi::changeFloor, floorRepository, ErrorCode.NOT_FOUND_FLOOR);
    }
}
