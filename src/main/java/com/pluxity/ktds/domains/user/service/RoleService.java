package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.domain.Role;
import com.pluxity.ktds.domains.user.domain.User;
import com.pluxity.ktds.domains.user.domain.UserRole;
import com.pluxity.ktds.domains.user.dto.RoleRequestDto;
import com.pluxity.ktds.domains.user.dto.RoleResponseDto;
import com.pluxity.ktds.domains.user.repository.RoleRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Validated
public class RoleService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    private Supplier<CustomException> getNotExistByIdExceptionSupplier(Long id) {
        return () -> new CustomException(ErrorCode.NOT_FOUND_ROLE, "id: " + id);
    }

    private void checkExistId(Long id) {
        roleRepository.findById(id).ifPresent(
                role -> {
                    throw new CustomException(ErrorCode.NOT_FOUND_ROLE, " id: " + id);
                }
        );
    }

    private void checkExistName(RoleRequestDto role) {
        roleRepository.findByName(role.name()).ifPresent(
                findRole -> {
                    throw new CustomException(ErrorCode.DUPLICATE_ROLE_NAME);
                }
        );
    }

    private RoleResponseDto toResponseDto(Role role) {
        return RoleResponseDto.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }


    @Transactional(readOnly = true)
    public List<RoleResponseDto> findAll() {
        return roleRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoleResponseDto findById(@NotNull Long id) {
        return toResponseDto(roleRepository.findById(id)
                .orElseThrow(getNotExistByIdExceptionSupplier(id)));
    }

    @Transactional
    public RoleResponseDto save(@NotNull @Valid RoleRequestDto dto) {
        checkExistName(dto);

        //        saveRoleWithUser(dto);
        Role role = Role.builder()
                .name(dto.name())
                .build();

        Role save = roleRepository.save(role);

        return toResponseDto(save);
    }


    @Transactional
    public void update(@NotNull Long id, @NotNull @Valid RoleRequestDto dto) {
        Role role = roleRepository.findById(id).orElseThrow(getNotExistByIdExceptionSupplier(id));
        checkExistName(dto);

        role.update(role);
        if (dto.userIds() != null) {
            List<User> users = userRepository.findAllById(dto.userIds());
            for (User user : users) {
                user.clearRole();
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(role)
                        .build();
                user.addUserRole(userRole);
            }
        }
    }

    @Transactional
    public void delete(@NotNull Long id) {
        roleRepository.findById(id).orElseThrow(getNotExistByIdExceptionSupplier(id));
        roleRepository.deleteById(id);
    }

    private void saveRoleWithUser(RoleRequestDto dto, Role role) {
        if (dto.userIds().isEmpty()) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_USER_IDS);
        }
        List<User> users = userRepository.findAllById(dto.userIds());
        for (User user : users) {
            UserRole userRole = UserRole.builder()
                    .user(user)
                    .role(role)
                    .build();
            user.addUserRole(userRole);
        }
    }
}
