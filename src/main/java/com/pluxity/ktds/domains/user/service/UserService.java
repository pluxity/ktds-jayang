package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.dto.*;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final UserGroupRepository userGroupRepository;

    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        List<User> users = repository.findAll();

        return users.stream()
                .map(this::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id) {
        var user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        return this.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findByUsername(String username) {
        var user = repository.findByUsername(username).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        return this.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findMe(Principal principal) {
        String username = principal.getName();
        var user = repository.findByUsername(username)
                .orElseThrow(() -> new CustomException(NOT_FOUND_USER));

        return this.from(user);
    }

    private UserResponseDTO from(User user) {
        return UserResponseDTO.builder()
                .username(user.getUsername())
                .name(user.getName())
                .groupName(user.getUserGroup().getName())
                .authorities(user.getUserGroup().getAuthorities()
                        .stream()
                        .map(UserAuthorityResponseDTO::from)
                        .collect(Collectors.toSet()))
                .build();
    }

    @Transactional(readOnly = true)
    public User findUserByUsername(String username) {
        return repository.findByUsername(username).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
    }

    @Transactional(readOnly = true)
    public boolean isUserExists(String username) {
        return repository.existsByUsername(username);
    }

    @Transactional
    public void save(CreateUserDTO dto) {
        User user = User.builder()
                .username(dto.username())
                .name(dto.name())
                .password(dto.password())
                .build();

        repository.save(user);
    }

    @Transactional
    public void save(CreateUserDTO dto, Map<String, Object> request) {
        UserGroup userGroup = userGroupRepository.findById(Long.parseLong(request.get("userGroupId").toString()))
                .orElseThrow(() -> new CustomException(NOT_FOUND_USER_GROUP));
        User user = User.builder()
                .username(dto.username())
                .name(dto.name())
                .password(dto.password())
                .userGroup(userGroup)
                .build();

        repository.save(user);
    }

    @Transactional
    public void update(Long id, UpdateUserDTO dto) {
        User user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        user.updateName(dto.name());
    }

    @Transactional
    public void changePassword(Long id, UpdatePasswordDTO dto) {
        User user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        user.changePassword(passwordEncoder.encode(dto.newPassword()));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findByUserid(String userid) {
        return repository.findByUsername(userid).orElseThrow(() -> new CustomException(NOT_FOUND_USER)).toResponseDTO();
    }
}
