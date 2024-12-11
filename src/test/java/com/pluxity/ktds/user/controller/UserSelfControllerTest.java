package com.pluxity.ktds.user.controller;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpRequestDTO;
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
        authService.signUp(new SignUpRequestDTO("user", "password", "User Name"));
        SignInResponseDTO userSignInResponse = authService.signIn(new SignInRequestDTO("user", "password"));
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