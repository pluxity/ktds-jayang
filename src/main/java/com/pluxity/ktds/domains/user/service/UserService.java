package com.pluxity.ktds.domains.user.service;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

import com.pluxity.ktds.domains.user.dto.ChangePasswordDto;
import com.pluxity.ktds.domains.user.dto.PatchDto;
import com.pluxity.ktds.domains.user.dto.ResponseDto;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository repository;

  private final PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public List<ResponseDto> findAll() {
    List<User> users = repository.findAll();

    return users.stream()
        .map(
            user ->
                new ResponseDto(
                    user.getUserId(),
                    user.getName(),
                    user.getRole()))
        .toList();
  }

  @Transactional(readOnly = true)
  public ResponseDto findById(Long id) {
    User user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));

    return ResponseDto.builder()
        .userId(user.getUserId())
        .name(user.getName())
        .role(user.getRole())
        .build();
  }

  @Transactional
  public void patch(Long id, PatchDto dto) {
    User user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
    user.updateInfo(dto.name());
  }

  @Transactional
  public void changePassword(Long id, ChangePasswordDto dto) {
    User user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
    user.changePassword(passwordEncoder.encode(dto.newPassword()));
  }

  @Transactional
  public void delete(Long id) {
    repository.deleteById(id);
  }

  @Transactional(readOnly = true)
  public ResponseDto myInfo(Principal principal) {
    var userId = principal.getName();
    User user =
        repository.findByUserId(userId).orElseThrow(() -> new CustomException(NOT_FOUND_USER));

    return new ResponseDto(
        user.getUserId(), user.getName(), user.getRole());
  }
}
