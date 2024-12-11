package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.domain.UserGroup;
import com.pluxity.ktds.domains.user.dto.UserGroupRequestDto;
import com.pluxity.ktds.domains.user.dto.UserGroupResponseDto;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
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

@Service
@RequiredArgsConstructor
public class UserGroupService {
    private final UserGroupRepository repository;

    @Transactional(readOnly = true)
    public List<UserGroupResponseDto> findAll() {
        return repository.findAll().stream()
                .map(this::toUserGroupResponseDto)
                .toList();
    }


    @Transactional(readOnly = true)
    public UserGroupResponseDto findById(@NotNull Long id) {
        UserGroup userGroup = repository.findById(id)
                .orElseThrow(notFoundIdException(id));
        return toUserGroupResponseDto(userGroup);
    }

    @Transactional
    public void save(@NotNull @Valid UserGroupRequestDto dto) {

        validateUserGroup(dto);

        repository.findByName(dto.name()).ifPresent(
                throwIfExistGroup()
        );
    }


    @Transactional
    public void update(@NotNull Long id, @NotNull @Valid UserGroupRequestDto dto) {

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
        notExistIdException(id);
        UserGroup userGroup = repository.findById(id).orElseThrow(
                notFoundIdException(id)
        );
        repository.delete(userGroup);
    }


    private Supplier<CustomException> notFoundIdException(Long id) {
        return () -> new CustomException(ErrorCode.NOT_FOUND_USER_GROUP, "id: " + id);
    }


    private UserGroupResponseDto toUserGroupResponseDto(UserGroup userGroup) {
        return UserGroupResponseDto.builder()
                .name(userGroup.getName())
                .build();
    }

    private void validateUserGroup(UserGroupRequestDto dto) {
        if (StringUtils.isBlank(dto.name())) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_USER_GROUP_NAME);
        }
    }

    private Consumer<UserGroup> throwIfExistGroup() {
        return userGroup -> {
            throw new CustomException(ErrorCode.DUPLICATE_USER_GROUP_NAME);
        };
    }

    private void notExistIdException(Long id) {
        if (id == null) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_ID);
        }
    }

}
