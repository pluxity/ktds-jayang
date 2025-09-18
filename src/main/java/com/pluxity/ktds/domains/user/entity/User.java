package com.pluxity.ktds.domains.user.entity;

import com.pluxity.ktds.domains.user.dto.UserAuthorityResponseDTO;
import com.pluxity.ktds.domains.user.dto.UserGroupBuildingPermissionDTO;
import com.pluxity.ktds.domains.user.dto.UserGroupCategoryPermissionDTO;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.stream.Collectors;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "plx_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 20)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "name", nullable = false, length = 10)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id", nullable = false)
    private UserGroup userGroup;

    @Builder
    public User(
            final String username,
            final String password,
            final String name,
            final UserGroup userGroup
    ) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.userGroup = userGroup;
    }

    public void changePassword(final String newPassword) {
        this.password = newPassword;
    }

    public void updateName(final String name) {
        this.name = name;
    }

    public void updateUserGroup(UserGroup userGroup) {
        this.userGroup = userGroup;
    }

    public UserResponseDTO toResponseDTO() {
        return UserResponseDTO.builder()
                .id(this.id)
                .username(this.username)
                .name(this.name)
                .groupName(getUserGroup().getName())
                .authorities(getUserGroup().getAuthorities()
                        .stream()
                        .map(UserAuthorityResponseDTO::from)
                        .collect(Collectors.toSet()))
                .buildingPermissions(this.getUserGroup().getBuildingPermissions()
                        .stream()
                        .map(bp -> UserGroupBuildingPermissionDTO.builder()
                                .buildingId(bp.getBuilding().getId())
                                .canRead(bp.getCanRead())
                                .canWrite(bp.getCanWrite())
                                .registeredBy(bp.getRegisteredBy())
                                .build())
                        .collect(Collectors.toSet()))
                .categoryPermissions(this.getUserGroup().getCategoryPermissions()
                        .stream()
                        .map(cp -> UserGroupCategoryPermissionDTO.builder()
                                .poiCategoryId(cp.getPoiCategory().getId())
                                .canRead(cp.getCanRead())
                                .canWrite(cp.getCanWrite())
                                .registeredBy(cp.getRegisteredBy())
                                .build())
                        .collect(Collectors.toSet()))
                .build();
    }
}
