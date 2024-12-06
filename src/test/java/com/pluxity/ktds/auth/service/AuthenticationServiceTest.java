package com.pluxity.ktds.auth.service;

import static com.pluxity.ktds.global.constant.ErrorCode.*;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDto;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDto;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDto;
import com.pluxity.ktds.domains.user.constant.Role;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
class AuthenticationServiceTest {

	@Autowired
	private AuthenticationService service;

	@Autowired
	EntityManager em;

	@Autowired
	private UserRepository userRepository;

	@Test
	@DisplayName("관리자 등록 - 성공")
	void signUpAdmin() {

		SignUpRequestDto dto = SignUpRequestDto.builder()
			.userId("admin")
			.password("pluxity123!@#")
			.name("관리자")
			.build();

		service.signUpAdmin(dto);

		em.flush();
		em.clear();

		User admin = userRepository.findByUserId("admin").orElseThrow();

		assertThat(admin.getUserId()).isEqualTo("admin");
		assertThat(admin.getName()).isEqualTo("관리자");
		assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
	}

	@Test
	@DisplayName("사용자 등록 - 성공")
	void signUp() {

		SignUpRequestDto dto = SignUpRequestDto.builder()
			.userId("nadk")
			.password("pluxity123!@#")
			.name("나동규")
			.build();

		service.signUp(dto);

		em.flush();
		em.clear();

		User user = userRepository.findByUserId("nadk").orElseThrow();

		assertThat(user.getUserId()).isEqualTo("nadk");
		assertThat(user.getName()).isEqualTo("나동규");
		assertThat(user.getRole()).isEqualTo(Role.USER);
	}

	@Test
	@DisplayName("로그인 - 성공")
	void signIn() {

		SignUpRequestDto dto = SignUpRequestDto.builder()
			.userId("nadk")
			.password("pluxity123!@#")
			.name("나동규")
			.build();

		service.signUp(dto);

		em.flush();
		em.clear();

		SignInRequestDto request = new SignInRequestDto("nadk","pluxity123!@#");
		SignInResponseDto response = service.signIn(request);

		assertThat(response.accessToken()).isNotNull();
		assertThat(response.refreshToken()).isNotNull();
		assertThat(response.name()).isEqualTo("나동규");
		assertThat(response.role()).isEqualTo(Role.USER);
	}

	@Test
	@DisplayName("로그인 - 실패(비밀 번호 불일치)")
	void signInFailure() {

		SignUpRequestDto dto = SignUpRequestDto.builder()
			.userId("nadk")
			.password("pluxity123!@#")
			.name("나동규")
			.build();

		service.signUp(dto);

		em.flush();
		em.clear();

		CustomException exception = assertThrows(CustomException.class, () -> {
			SignInRequestDto request = new SignInRequestDto("nadk","wrongPassword");
			SignInResponseDto response = service.signIn(request);
		});


		assertThat(exception.getErrorCode()).isEqualTo(INVALID_ID_OR_PASSWORD);
	}
}