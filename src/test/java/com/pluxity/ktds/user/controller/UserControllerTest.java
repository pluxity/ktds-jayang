package com.pluxity.ktds.user.controller;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDTO;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthenticationService authService;

    @Autowired
    EntityManager em;

    @Autowired
    UserRepository userRepository;

    private String token;
    private Long id;

    @BeforeEach
    void setUp() {
        SignUpRequestDTO adminSignUpRequestDTO = new SignUpRequestDTO(
                "admin", "admin", "관리자");
        authService.signUpAdmin(adminSignUpRequestDTO);

        SignInResponseDTO adminSignInResponse = authService.signIn(new SignInRequestDTO("admin", "admin"));
        token = adminSignInResponse.accessToken();

        authService.signUp(new SignUpRequestDTO("testId", "testPassword", "홍길동"));
        User testUser = userRepository.findByUserId("testId").orElseThrow(() -> new RuntimeException("User not found"));
        id = testUser.getId();

        em.clear();
    }

    @Test
    @DisplayName("전체 사용자 목록 조회")
    void getUsers() throws Exception {
        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].userId").value("admin"))
                .andExpect(jsonPath("$.result[?(@.userId == 'testId')]").exists())
                .andDo(print());
    }

    @Test
    @DisplayName("사용자 목록 조회")
    void getUser() throws Exception {
        mockMvc.perform(get("/users/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.userId").value("testId"))
                .andDo(print());
    }

    @Test
    @DisplayName("사용자 비밀번호 수정")
    void changePassword() throws Exception {
        mockMvc.perform(patch("/users/" + id + "/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("{\"password\": \"testPassword\", \"newPassword\": \"newPassword\"}"))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andDo(print());
    }

    @Test
    @DisplayName("사용자 삭제")
    void deleteUser() throws Exception {
        mockMvc.perform(delete("/users/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.status").value("NO_CONTENT"))
                .andDo(print());
    }
}