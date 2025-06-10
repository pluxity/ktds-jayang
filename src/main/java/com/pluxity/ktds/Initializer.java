package com.pluxity.ktds;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.dto.CreateBuildingDTO;
import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.service.BuildingService;
import com.pluxity.ktds.domains.kiosk.service.KioskPoiService;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiMiddleCategoryRepository;
import com.pluxity.ktds.domains.poi_set.service.PoiMiddleCategoryService;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.repository.SystemSettingRepository;
import com.pluxity.ktds.domains.system_setting.service.SystemSettingService;
import com.pluxity.ktds.domains.user.entity.KioskUser;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.repository.KioskUserRepository;
import com.pluxity.ktds.domains.user.repository.UserAuthorityRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.CustomMultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
public class Initializer implements CommandLineRunner {
    private final SystemSettingService systemSettingService;
    private final SystemSettingRepository systemSettingRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;
    private final UserAuthorityRepository userAuthorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileInfoService fileInfoService;
    private final SaveImage imageStrategy;
    private final IconSetRepository iconSetRepository;
    private final PoiCategoryRepository poiCategoryRepository;
    private final BuildingRepository buildingRepository;
    private final BuildingService buildingService;
    private final KioskUserRepository kioskUserRepository;
    private static final String ICON_RESOURCE_PATH = "static/images/viewer/categoryIcon";
    private final KioskPoiService kioskPoiService;
    private final PoiMiddleCategoryService poiMiddleCategoryService;
    private final PoiMiddleCategoryRepository poiMiddleCategoryRepository;

    private final ObjectMapper objectMapper;

    @Value("${root-path.files}")
    private String rootPath;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("init start");
        if (!userRepository.existsByUsername("admin")) {
            List<UserGroup> userGroups = getUserGroups();

//            UserGroup userGroup = getOrCreateUserGroup("관리자", "ADMIN");
            User user = User.builder()
                    .userGroup(userGroups.getFirst())
                    .username("admin")
                    .password(passwordEncoder.encode("pluxity123!@#"))
                    .name("관리자")
                    .build();
            userRepository.save(user);

        }
        if(systemSettingRepository.findAll().isEmpty()) {
            SystemSettingRequestDTO systemSettingRequestDto = SystemSettingRequestDTO.builder()
                    .poiIconSizeRatio(100)
                    .poiLineLength(30)
                    .poiTextSizeRatio(100)
                    .nodeDefaultColor("#FF0000")
                    .build();
            systemSettingService.updateSystemSetting(systemSettingRequestDto);
        }
        if(!kioskUserRepository.existsByName("kiosk")) {
            KioskUser kiosk = KioskUser.builder()
                    .password(passwordEncoder.encode("pluxity123!@#"))
                    .name("kiosk")
                    .build();
            kioskUserRepository.save(kiosk);
        }

//        // resources/icon default 추가
//        if (iconSetRepository.findAll().isEmpty()) {
//            ClassPathResource listResource = new ClassPathResource("static/images/viewer/categoryIcon/filelist.txt");
//
//            try (InputStream is = listResource.getInputStream();
//                 BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
//
//                String fileName;
//                while ((fileName = reader.readLine()) != null) {
//                    if (!fileName.trim().isEmpty()) {
//                        ClassPathResource fileResource = new ClassPathResource("static/images/viewer/categoryIcon/" + fileName);
//                        uploadFile(fileResource);
//                    }
//                }
//
//            } catch (IOException e) {
//                throw new CustomException(ErrorCode.INVALID_FILE);
//            }
//        }

        if (!buildingRepository.existsByIsIndoor("N")) {
            try {
                Resource resource = new ClassPathResource("static/assets/modeling/outside/KTDS_Out_All_250109.zip");
                byte[] fileContent;
                try (InputStream is = resource.getInputStream()) {
                    fileContent = is.readAllBytes();
                }

                MultipartFile multipartFile = new CustomMultipartFile(
                        resource.getFilename(),
                        resource.getFilename(),
                        "application/zip",
                        fileContent
                );
                FileInfoDTO fileInfoDTO = buildingService.saveFile(multipartFile, "v1");

                CreateBuildingDTO dto = CreateBuildingDTO.builder()
                        .code("Outdoor")
                        .description("외부 전경")
                        .fileInfoId(fileInfoDTO.id())
                        .isIndoor("N")
                        .name("외부 전경")
                        .version("v1")
                        .build();

                Long buildingId = buildingService.saveBuilding(dto);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        initIconSet();
        initPoiCategoryFromJson();
        initMiddleCategoryFromJson();
    }

    private List<UserGroup> getUserGroups() {
        List<UserGroup> userGroups = userGroupRepository.findAll();
        if (userGroups.isEmpty()) {
            UserGroup userGroup = UserGroup.builder()
                    .name("관리자")
                    .build();
            UserGroup savedUserGroup = userGroupRepository.save(userGroup);
            userGroups.add(savedUserGroup);

            UserAuthority adminAuthority = UserAuthority.builder()
                    .name("ADMIN")
                    .build();
            adminAuthority.assignToUserGroup(savedUserGroup);
            userAuthorityRepository.save(adminAuthority);
        }

        return userGroups;
    }

    private FileInfoDTO uploadFile(File file) {

        try {
            FileInfoDTO fileInfo = fileInfoService.saveFile(file, FileEntityType.ICON2D, imageStrategy);
            String fileNameWithoutExt = fileInfo.originName().replace("." + fileInfo.extension(), "").toUpperCase();
            if ("svg".equalsIgnoreCase(fileInfo.extension())) {
                String iconName = fileNameWithoutExt;
                if (!iconSetRepository.existsByName(iconName)) {
                    IconSetRequestDTO iconSetRequestDTO = IconSetRequestDTO.builder()
                            .name(fileNameWithoutExt)
                            .iconFile2DId(fileInfo.id())
                            .build();
                    IconSet iconSet = IconSet.builder()
                            .name(iconSetRequestDTO.name())
                            .build();

                    updateIcons(iconSetRequestDTO.iconFile2DId(), iconSet::updateFileInfo2D);
                    updateIcons(iconSetRequestDTO.iconFile3DId(), iconSet::updateFileInfo3D);

                    iconSetRepository.save(iconSet);
                }
            }

            return fileInfo;

        } catch (IOException e) {
            throw new CustomException(ErrorCode.INVALID_FILE);
        }
    }
    private void updateIcons(Long iconFileId, Consumer<FileInfo> updater) {
        if (iconFileId != null) {
            FileInfo fileInfo = fileInfoService.findById(iconFileId);
            updater.accept(fileInfo);
        }
    }

    private FileInfoDTO uploadFile(ClassPathResource resource) throws IOException {
        try (InputStream is = resource.getInputStream()) {
            String fileName = resource.getFilename();
            MultipartFile multipartFile = new CustomMultipartFile(
                    fileName,
                    fileName,
                    Files.probeContentType(Paths.get(fileName)),
                    is.readAllBytes()
            );

            FileInfoDTO fileInfo = fileInfoService.saveFile(multipartFile, FileEntityType.ICON2D, imageStrategy);

            String fileNameWithoutExt = fileInfo.originName().replace("." + fileInfo.extension(), "").toUpperCase();
            if ("svg".equalsIgnoreCase(fileInfo.extension())) {
                IconSetRequestDTO iconSetRequestDTO = IconSetRequestDTO.builder()
                        .name(fileNameWithoutExt)
                        .iconFile2DId(fileInfo.id())
                        .build();
                IconSet iconSet = IconSet.builder()
                        .name(iconSetRequestDTO.name())
                        .build();

                updateIcons(iconSetRequestDTO.iconFile2DId(), iconSet::updateFileInfo2D);
                updateIcons(iconSetRequestDTO.iconFile3DId(), iconSet::updateFileInfo3D);

                IconSet savedIconSet = iconSetRepository.save(iconSet);
            }

            return fileInfo;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INVALID_FILE);
        }
    }

    public void initPoiCategoryFromJson() {
//        Resource categoryJson = new ClassPathResource("static/sample/categories.json");
        File jsonFile = new File(rootPath + File.separator + "categories.json");
        try (InputStream is = new FileInputStream(jsonFile)) {
            Map<String, List<String>> categories = objectMapper.readValue(is, new TypeReference<>() {});

            categories.keySet().stream()
                    .filter(major -> !poiCategoryRepository.existsByName(major))
                    .map(major -> PoiCategory.builder().name(major).build())
                    .forEach(poiCategoryRepository::save);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // icon 경로는 추후 수정
    public void initIconSet() {
        File folder = new File(rootPath + File.separator + "icon");
        if (!folder.exists()) {
            throw new CustomException(ErrorCode.INVALID_FILE);
        }
        File[] svgFiles = folder.listFiles((dir, name) ->
                name.toLowerCase().endsWith(".svg")
        );
        if (svgFiles != null) {
            for (File svg : svgFiles) {
                try {
                    String fileName = svg.getName();
                    String iconSetName = fileName.substring(0, fileName.lastIndexOf("."));
                    System.out.println("iconSetName : " + iconSetName);
                    if (!iconSetRepository.existsByName(iconSetName)) {
                        uploadFile(svg);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void initMiddleCategoryFromJson() {
        File jsonFile = new File(rootPath + File.separator + "categories.json");
        List<String> manualCategories = List.of("전력", "조명", "태양광", "주차관제", "VAV", "지열");
        try (InputStream is = new FileInputStream(jsonFile)) {
            Map<String, List<String>> categories = objectMapper.readValue(is, new TypeReference<>() {});

            for (Map.Entry<String, List<String>> entry : categories.entrySet()) {
                String majorName = entry.getKey();
                List<String> minors = entry.getValue();
                if (minors == null)
                    continue;

                PoiCategory poiCategory = poiCategoryRepository.findByName(majorName).orElse(null);
                if (poiCategory == null)
                    continue;
                for (String minorName : minors) {
                    if (poiMiddleCategoryRepository.existsByNameAndPoiCategoryId(minorName, poiCategory.getId())) {
                        continue;
                    }

                    String iconSetName = manualCategories.contains(majorName) ? majorName : minorName;
                    Optional<IconSet> optionalIconSet = iconSetRepository.findByName(iconSetName);
                    if (optionalIconSet.isEmpty())
                        continue;

                    PoiMiddleCategoryRequestDTO dto = PoiMiddleCategoryRequestDTO.builder()
                            .name(minorName)
                            .majorCategory(poiCategory.getId())
                            .iconSetIds(List.of(optionalIconSet.get().getId()))
                            .build();
                    poiMiddleCategoryService.save(dto);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
