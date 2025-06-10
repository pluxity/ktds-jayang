package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.dto.CreateAuthorityDTO;
import com.pluxity.ktds.domains.user.dto.UserAuthorityResponseDTO;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.repository.UserAuthorityRepository;
import com.pluxity.ktds.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_ID;

@Service
@RequiredArgsConstructor
public class UserAuthorityService {

    private final UserAuthorityRepository repository;

    @Transactional
    public void save(CreateAuthorityDTO dto) {
        UserAuthority authority = UserAuthority.builder()
                .name(dto.name())
                .build();

        repository.save(authority);
    }

    @Transactional(readOnly = true)
    public UserAuthorityResponseDTO findById(Long id) {
        var userAuthority = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_ID));
        return UserAuthorityResponseDTO.from(userAuthority);
    }

    @Transactional(readOnly = true)
    public List<UserAuthorityResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(UserAuthorityResponseDTO::from)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
