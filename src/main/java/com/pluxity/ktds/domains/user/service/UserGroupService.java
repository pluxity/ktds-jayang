package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.dto.CreateUserGroupDTO;
import com.pluxity.ktds.domains.user.dto.UserGroupResponseDTO;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import io.micrometer.common.util.StringUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class UserGroupService {

    private final UserGroupRepository repository;

    private final UserRepository userRepository;

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
