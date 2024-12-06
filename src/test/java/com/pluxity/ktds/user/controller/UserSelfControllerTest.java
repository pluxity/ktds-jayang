package com.pluxity.ktds.user.controller;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDto;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDto;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDto;
import com.pluxity.ktds.domains.auth.service.AuthenticationService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserSelfControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthenticationService authService;

    @Autowired
    EntityManager em;

    @Autowired
    UserRepository userRepository;

    private String token;

    @BeforeEach
    void setUp() {
        authService.signUp(new SignUpRequestDto("user", "password", "User Name"));
        SignInResponseDto userSignInResponse = authService.signIn(new SignInRequestDto("user", "password"));
        token = userSignInResponse.accessToken();

        em.clear();
    }

    @Test
    @DisplayName("내 정보 조회")
    void getMyInfo() throws Exception {
        mockMvc.perform(get("/users/my-info")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.userId").value("user"))
                .andExpect(jsonPath("$.result.name").value("User Name"))
                .andDo(print());
    }
}