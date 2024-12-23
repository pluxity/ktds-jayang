package com.pluxity.ktds;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.service.BuildingService;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.service.IconSetService;
import com.pluxity.ktds.domains.poi_set.service.PoiCategoryService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.domains.user.entity.Role;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.repository.RoleRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.security.repository.RefreshTokenRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CreateDomain {

    @Autowired
    UserRepository userRepository;
    @Autowired
    RefreshTokenRepository refreshTokenRepository;
    @Autowired
    UserGroupRepository userGroupRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    BuildingService buildingService;
    @Autowired
    SaveImage imageStrategy;
    @Autowired
    SaveZipFile zipStrategy;
    @Autowired
    IconSetService iconSetService;
    @Autowired
    EntityManager em;
    @Autowired
    PoiCategoryService poiCategoryService;
    @Autowired
    PoiCategoryRepository poiCategoryRepository;


    public void clearCache() {
        em.flush();
        em.clear();
    }

    public String getUuid() {
        return UUID.randomUUID().toString().substring(0, 10);
    }

    public Long createUserGroup() {
        UserGroup buildUserGroup = UserGroup.builder()
                .name(getUuid())
                .build();
        UserGroup save = userGroupRepository.save(buildUserGroup);
        clearCache();
        return save.getId();
    }

    public Long createRole() {
        Role buildRole = Role.builder()
                .name(getUuid())
                .build();
        Role save = roleRepository.save(buildRole);
        clearCache();
        return save.getId();
    }


    public Long createUser() {
        UserGroup userGroup = userGroupRepository.findById(createUserGroup()).orElseThrow();
        User user = User.builder()
                .userGroup(userGroup)
                .username(getUuid())
                .nickname(getUuid())
                .password(passwordEncoder.encode(getUuid()))
                .build();
        User save = userRepository.save(user);
        clearCache();
        return save.getId();
    }

    public UserAuthority createUserRole() {
        User user = userRepository.findById(createUser()).orElseThrow();
        Role role = roleRepository.findById(createRole()).orElseThrow();
        UserAuthority userRole = UserAuthority.builder()
                .user(user)
                .role(role)
                .build();
        user.addUserRole(userRole);
        clearCache();
        return userRole;
    }

    public static String generateUUID() {
        return generateUUID(0, 10);
    }

    public static String generateUUID(int start, int end) {
        if (start < 0) {
            start = 0;
        } else if (start > 36) {
            start = 36;
        }

        if (end < 0) {
            end = 0;
        } else if (end > 36) {
            end = 36;
        }
        return UUID.randomUUID().toString().substring(start, end).replace("-", "");
    }


}
