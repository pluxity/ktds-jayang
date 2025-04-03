package com.pluxity.ktds;

import com.pluxity.ktds.domains.building.dto.CreateBuildingDTO;
import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.service.BuildingService;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.repository.SystemSettingRepository;
import com.pluxity.ktds.domains.system_setting.service.SystemSettingService;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.repository.UserAuthorityRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.CustomMultipartFile;
import lombok.RequiredArgsConstructor;
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
    private static final String ICON_RESOURCE_PATH = "static/images/viewer/categoryIcon";

    @Override
    public void run(String... args) throws Exception {
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
                FileInfoDTO fileInfoDTO = buildingService.saveFile(multipartFile);

                CreateBuildingDTO dto = CreateBuildingDTO.builder()
                        .code("Outdoor")
                        .description("외부 전경")
                        .fileInfoId(fileInfoDTO.id())
                        .isIndoor("N")
                        .name("외부 전경")
                        .build();

                Long buildingId = buildingService.saveBuilding(dto);
                System.out.println("Outdoor building created with id: " + buildingId);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

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

                PoiCategory poiCategory = PoiCategory.builder()
                        .name(fileNameWithoutExt)
                        .build();
                poiCategory.updateImageFile(savedIconSet.getIconFile2D());
                poiCategory.updateIconSets(List.of(savedIconSet));
                poiCategoryRepository.save(poiCategory);
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

                PoiCategory poiCategory = PoiCategory.builder()
                        .name(fileNameWithoutExt)
                        .build();
                poiCategory.updateImageFile(savedIconSet.getIconFile2D());
                poiCategory.updateIconSets(List.of(savedIconSet));
                poiCategoryRepository.save(poiCategory);
            }

            return fileInfo;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INVALID_FILE);
        }
    }
}
