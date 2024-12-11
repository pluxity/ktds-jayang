package com.pluxity.ktds.user.service;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import com.pluxity.ktds.domains.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.pluxity.ktds.domains.auth.dto.SignUpRequestDTO;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.domains.user.constant.Role;
import com.pluxity.ktds.domains.user.dto.PatchDTO;
import com.pluxity.ktds.domains.user.dto.ResponseDTO;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class UserServiceTest {

	@Autowired
	private UserService userService;
	@Autowired
	private AuthenticationService authService;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	EntityManager em;

	@BeforeEach
	void setUp() {
		authService.signUp(new SignUpRequestDTO("testId", "testPassword", "홍길동"));
		authService.signUp(new SignUpRequestDTO("k2ngis", "testPassword2", "나동규"));

		em.clear();
	}

	@Test
	@DisplayName("회원 정보 By ID 조회")
	void findById() {

		Long id = userRepository.findAll().getFirst().getId();

		ResponseDTO result = userService.findById(id);

		assertThat(result.name()).isEqualTo("홍길동");
		assertThat(result.role()).isEqualTo(Role.USER);
	}

	@Test
	@DisplayName("회원 정보 전체 조회")
	void findAll() {
		List<ResponseDTO> result = userService.findAll();

		assertThat(result.size()).isEqualTo(2);
		assertThat(result.get(0).name()).isEqualTo("홍길동");
		assertThat(result.get(1).name()).isEqualTo("나동규");
	}

	@Test
	@DisplayName("회원 정보 수정")
	void patch() {

		var dto = new PatchDTO("홍길동");
		Long id = userRepository.findAll().getFirst().getId();


		userService.patch(id, dto);

		em.flush();

		userRepository.findById(id).ifPresentOrElse(
				user -> {
					assertThat(user.getName()).isEqualTo("홍길동");
				},
				() -> fail("회원 정보 수정 실패")
		);
	}

	@Test
	@DisplayName("회원 비밀번호 수정")
	void changePassword() {
		Long id = userRepository.findAll().getFirst().getId();

		userRepository.findById(id).ifPresentOrElse(
				user -> user.changePassword("testPassword"),
				() -> fail("회원 비밀번호 수정 실패")
		);

		em.flush();

		userRepository.findById(id).ifPresentOrElse(
			user -> assertThat(user.getPassword()).isEqualTo("testPassword"),
			() -> fail("회원 비밀번호 수정 실패")
		);
	}

	@Test
	@DisplayName("회원 삭제")
	void delete() {

		Long id = userRepository.findAll().getFirst().getId();
		userService.delete(id);

		em.flush();

		assertThat(userRepository.findById(id).isEmpty()).isTrue();
	}
}