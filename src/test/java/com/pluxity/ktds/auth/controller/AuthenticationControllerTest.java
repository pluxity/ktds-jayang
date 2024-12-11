package com.pluxity.ktds.auth.controller;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.pluxity.ktds.domains.auth.dto.SignUpRequestDTO;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthenticationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AuthenticationService authService;

	@Autowired
	EntityManager em;

	@Autowired
	UserRepository userRepository;

	@Test
	@DisplayName("사용자 등록 - 성공")
	void signUp() throws Exception {

		mockMvc.perform(MockMvcRequestBuilders.post("/auth/sign-up")
				.contentType("application/json")
				.content("{\"userId\":\"nadk\",\"password\":\"pluxity123!@#\",\"name\":\"나동규\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("CREATED"))
			.andExpect(jsonPath("$.message").value("등록 성공"))
			.andDo(print());
	}

	@Test
	@DisplayName("로그인 - 성공")
	void signIn() throws Exception {

		SignUpRequestDTO dto = SignUpRequestDTO.builder()
			.userId("nadk")
			.password("pluxity123!@#")
			.name("나동규")
			.build();

		authService.signUp(dto);

		em.flush();
		em.clear();

		mockMvc.perform(MockMvcRequestBuilders.post("/auth/sign-in")
				.contentType("application/json")
				.content("{\"userId\":\"nadk\",\"password\":\"pluxity123!@#\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("OK"))
			.andExpect(jsonPath("$.message").value("성공"))
			.andDo(print());
	}

	@Test
	@DisplayName("로그인 - 실패(비밀 번호 불일치)")
	void signInFailure() throws Exception {

		SignUpRequestDTO dto = SignUpRequestDTO.builder()
			.userId("nadk")
			.password("pluxity123!@#")
			.name("나동규")
			.build();

		authService.signUp(dto);

		em.flush();
		em.clear();

		mockMvc.perform(MockMvcRequestBuilders.post("/auth/sign-in")
				.contentType("application/json")
				.content("{\"userId\":\"nadk\",\"password\":\"wrong_password\"}"))
			.andExpect(status().is4xxClientError())
			.andExpect(jsonPath("$.status").value("BAD_REQUEST"))
			.andExpect(jsonPath("$.message").value("아이디 또는 비밀번호가 틀렸습니다."))
			.andDo(print());
	}

}