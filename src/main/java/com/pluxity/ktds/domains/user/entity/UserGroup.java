package com.pluxity.ktds.domains.user.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.user.dto.UserGroupBuildingPermissionDTO;
import com.pluxity.ktds.domains.user.dto.UserGroupCategoryPermissionDTO;
import com.pluxity.ktds.domains.user.dto.UserGroupResponseDTO;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "plx_user_group")
public class UserGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "group_type", nullable = false, length = 20)
    private String groupType;

    @Column(name = "description", length = 200)
    private String description;

    @OneToMany(mappedBy = "userGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserGroupBuilding> buildingPermissions = new HashSet<>();

    @OneToMany(mappedBy = "userGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserGroupPoiCategory> categoryPermissions = new HashSet<>();

    @OneToMany(mappedBy = "userGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserGroupMenu> menuPermissions = new HashSet<>();

    @OneToMany(mappedBy = "userGroup", orphanRemoval = true)
    @BatchSize(size = 10)
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "userGroup", orphanRemoval = true)
    @BatchSize(size = 10)
    private Set<UserAuthority> authorities;

    @Builder
    public UserGroup(String name, String groupType, String description) {
        this.name = name;
        this.groupType = groupType;
        this.description = description;
    }

    public void addUser(User user) {
        if (!users.contains(user)) {
            users.add(user);
            user.updateUserGroup(this); // 양방향 관계 설정
        }
    }

    public void removeUser(User user) {
        if (users.contains(user)) {
            users.remove(user);
            user.updateUserGroup(null); // 양방향 관계 해제
        }
    }

    public UserGroupResponseDTO toResponseDTO() {
        return UserGroupResponseDTO.builder()
                .id(this.getId())
                .name(this.getName())
                .groupType(this.getGroupType())
                .description(this.getDescription())
                .buildingPermissions(this.getBuildingPermissions().stream()
                        .map(bp -> UserGroupBuildingPermissionDTO.builder()
                                .buildingId(bp.getBuilding().getId())
                                .canRead(bp.getCanRead())
                                .canWrite(bp.getCanWrite())
                                .registeredBy(bp.getRegisteredBy())
                                .build())
                        .collect(Collectors.toSet()))
                .categoryPermissions(this.getCategoryPermissions().stream()
                        .map(cp -> UserGroupCategoryPermissionDTO.builder()
                                .poiCategoryId(cp.getPoiCategory().getId())
                                .canRead(cp.getCanRead())
                                .canWrite(cp.getCanWrite())
                                .registeredBy(cp.getRegisteredBy())
                                .build())
                        .collect(Collectors.toSet()))
                .menuPermissions(this.getMenuPermissions().stream()
                        .map(UserGroupMenu::getMenuType)
                        .collect(Collectors.toSet()))
                .build();
    }
    public void update(UserGroup userGroup) {
        if (StringUtils.hasText(userGroup.getName())) {
            this.name = userGroup.getName();
        }
        if (StringUtils.hasText(userGroup.getGroupType())) {
            this.groupType = userGroup.getGroupType();
        }
        if (StringUtils.hasText(userGroup.getDescription())) {
            this.description = userGroup.getDescription();
        }
    }
}
