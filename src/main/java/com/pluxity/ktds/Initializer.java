package com.pluxity.ktds;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.service.IconSetService;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingRequestDTO;
import com.pluxity.ktds.domains.system_setting.repository.SystemSettingRepository;
import com.pluxity.ktds.domains.system_setting.service.SystemSettingService;
import com.pluxity.ktds.domains.user.dto.CreateAuthorityDTO;
import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.dto.CreateUserGroupDTO;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.repository.UserAuthorityRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.domains.user.service.UserAuthorityService;
import com.pluxity.ktds.domains.user.service.UserGroupService;
import com.pluxity.ktds.domains.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class Initializer implements CommandLineRunner {
    private final SystemSettingService systemSettingService;
    private final SystemSettingRepository systemSettingRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;
    private final UserAuthorityRepository userAuthorityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            List<UserGroup> userGroups = getUserGroups();

            User user = User.builder()
                    .userGroup(userGroups.get(0))
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
//            List<UserAuthority> authorities = Arrays.asList(
//                    UserAuthority.builder().name("ADMIN").build(),
//                    UserAuthority.builder().name("USER").build()
//            );
//            for (UserAuthority authority : authorities) {
//                authority.assignToUserGroup(savedUserGroup);
//            }
//            userAuthorityRepository.saveAll(authorities);
        }

        return userGroups;
    }

}
