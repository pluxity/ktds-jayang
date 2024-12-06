package com.pluxity.ktds.domains.user.dto;

import com.pluxity.ktds.domains.user.constant.Role;
import lombok.Builder;

@Builder
public record ResponseDto(String userId, String name, Role role) {}
