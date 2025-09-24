package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.user.constant.MenuType;
import com.pluxity.ktds.domains.user.dto.*;
import com.pluxity.ktds.domains.user.entity.*;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Supplier;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class UserGroupService {

    private final UserGroupRepository repository;

    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final PoiCategoryRepository poiCategoryRepository;

    @Transactional(readOnly = true)
    public List<UserGroupResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(UserGroup::toResponseDTO)
                .toList();
    }


    @Transactional(readOnly = true)
    public UserGroupResponseDTO findById(@NotNull Long id) {
        return repository.findById(id)
                .orElseThrow(notFoundIdException(id))
                .toResponseDTO();

    }

    @Transactional
    public void save(@NotNull @Valid CreateUserGroupDTO dto) {

        validateUserGroup(dto);

        repository.findByName(dto.name()).ifPresent(
                throwIfExistGroup()
        );

        UserGroup userGroup = UserGroup.builder()
                .name(dto.name())
                .groupType(dto.groupType())
                .description(dto.description())
                .build();

        repository.save(userGroup);
    }


    @Transactional
    public void update(@NotNull Long id, @NotNull @Valid CreateUserGroupDTO dto) {

        validateUserGroup(dto);
        notExistIdException(id);

        repository.findByName(dto.name()).ifPresent(throwIfExistGroup());

        UserGroup userGroup = repository.findById(id).orElseThrow(notFoundIdException(id));
        userGroup.update(UserGroup.builder()
                .name(dto.name())
                .groupType(dto.groupType())
                .description(dto.description())
                .build());
    }


    @Transactional
    public void delete(@NotNull Long id) {
        UserGroup userGroup = repository.findById(id).orElseThrow(
                notFoundIdException(id)
        );

        List<User> users = userRepository.findByUserGroupId(id);
        if (users.size() > 0) {
            throw new CustomException(FAILED_DELETE_ACCOUNT_GROUP_ACCOUNT);
        }

        repository.delete(userGroup);
    }

    @Transactional
    public void updatePermissions(Long id, UpdateUserGroupPermissionDTO dto) {
        UserGroup group = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));

        if (dto.buildingPermissions() != null) {
            group.getBuildingPermissions().clear();

            for (UserGroupBuildingPermissionDTO b : dto.buildingPermissions()) {
                Building building = buildingRepository.findById(b.buildingId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 건물 ID: " + b.buildingId()));

                UserGroupBuilding permission = UserGroupBuilding.builder()
                        .userGroup(group)
                        .building(building)
                        .canRead(b.canRead())
                        .canWrite(b.canWrite())
                        .registeredBy(b.registeredBy())
                        .build();

                group.getBuildingPermissions().add(permission);
            }
        }

        if (dto.categoryPermissions() != null) {
            group.getCategoryPermissions().clear();

            for (UserGroupCategoryPermissionDTO c : dto.categoryPermissions()) {
                PoiCategory category = poiCategoryRepository.findById(c.poiCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리 ID: " + c.poiCategoryId()));

                UserGroupPoiCategory permission = UserGroupPoiCategory.builder()
                        .userGroup(group)
                        .poiCategory(category)
                        .canRead(c.canRead())
                        .canWrite(c.canWrite())
                        .registeredBy(c.registeredBy())
                        .build();

                group.getCategoryPermissions().add(permission);
            }
        }
        if (dto.menuPermissions() != null) {
            group.getMenuPermissions().clear();
            for (MenuType menuType : dto.menuPermissions()) {
                UserGroupMenu permission = new UserGroupMenu(menuType, group);
                group.getMenuPermissions().add(permission);
            }
        }
    }

    private Supplier<CustomException> notFoundIdException(Long id) {
        return () -> new CustomException(NOT_FOUND_USER_GROUP, "id: " + id);
    }


    private void validateUserGroup(CreateUserGroupDTO dto) {
        if (StringUtils.isBlank(dto.name())) {
            throw new CustomException(EMPTY_VALUE_USER_GROUP_NAME);
        }
    }

    private Consumer<UserGroup> throwIfExistGroup() {
        return userGroup -> {
            throw new CustomException(DUPLICATE_USER_GROUP_NAME);
        };
    }

    private void notExistIdException(Long id) {
        if (id == null) {
            throw new CustomException(EMPTY_VALUE_ID);
        }
    }
}
