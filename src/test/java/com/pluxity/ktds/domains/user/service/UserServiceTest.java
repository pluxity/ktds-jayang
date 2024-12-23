package com.pluxity.ktds.domains.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.CreateDomain;
import com.pluxity.ktds.domains.user.entity.Role;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.dto.RoleRequestDto;
import com.pluxity.ktds.domains.user.dto.RoleResponseDto;
import com.pluxity.ktds.domains.user.dto.UserRequestDto;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.repository.RoleRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.pluxity.ktds.ApiDocumentUtils.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
@AutoConfigureRestDocs
class UserServiceTest {

    @Autowired
    CreateDomain cd;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    UserRepository repository;
    @Autowired
    UserGroupRepository userGroupRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;
    @Autowired
    RoleService roleService;
    @Autowired
    MockMvc mockMvc;
    @Autowired
    EntityManager em;
    @Autowired
    PasswordEncoder passwordEncoder;


    @Test
    void 저장및_조회() {
        //given
        Long userId = cd.createUser();
        //when
        User user = repository.findById(userId).orElseThrow();
        //then
        assertThat(user.getId()).isEqualTo(userId);
    }

    @Test
    void 저장_사용자아이디중복_예외처리() {
        //given
        Long userId = cd.createUser();
        //when
        User user = repository.findById(userId).orElseThrow();
        User duplicateUser = User.builder()
                .username(user.getUsername())
                .nickname(user.getNickname())
                .password(user.getPassword())
                .build();
        //then
        Assertions.assertThrows(Exception.class, () -> repository.save(duplicateUser));
    }

    @Test
    void 로그인() throws Exception {
        //given
        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        User user = User.builder()
                .userGroup(userGroup)
                .username("test")
                .password(passwordEncoder.encode("test")) //save할때 encode하는데, 여기서는 수동으로
                .nickname("test")
                .build();
        repository.save(user);

        //when
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("username", "test");
        requestBody.put("password", "test");
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/login")
                .contentType("application/json")
                .content(jsonBody);

        MockHttpServletResponse response = mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        requestFields(
                                fieldWithPath("username").type(JsonFieldType.STRING).description("아이디").optional(),
                                fieldWithPath("password").type(JsonFieldType.STRING).description("패스워드").optional()
                        )
                ))
                .andReturn()
                .getResponse();

        //then
        // TODO 로그인 시 JWT 키 리턴
        assertThat(response.getCookie("AccessToken")).isNotNull();
        assertThat(response.getCookie("RefreshToken")).isNotNull();

    }

    @Test
    void 로그인_실패_예외처리_아이디없음() throws Exception {
        //given
        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        User user = User.builder()
                .userGroup(userGroup)
                .username("test")
                .password(passwordEncoder.encode("test")) //save할때 encode하는데, 여기서는 수동으로
                .nickname("test")
                .build();
        repository.save(user);
        em.flush();
        em.clear();
        //when
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("username", "invalid");
        requestBody.put("password", "test");
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/login")
                .contentType("application/json")
                .content(jsonBody);


        //then
        MockHttpServletResponse response = mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        requestFields(
                                fieldWithPath("username").type(JsonFieldType.STRING).description("아이디"),
                                fieldWithPath("password").type(JsonFieldType.STRING).description("패스워드")
                        )))
                .andReturn()
                .getResponse();
        assertThat(response.getContentAsString()).contains("NOT_FOUND_USER");


    }

//    @Test
    void 로그인_실패_예외처리_비밀번호틀림() throws Exception {
        //given
        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        User user = User.builder()
                .userGroup(userGroup)
                .username("test")
                .password(passwordEncoder.encode("test")) //save할때 encode하는데, 여기서는 수동으로
                .nickname("test")
                .build();
        repository.save(user);
        //when
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("username", "test");
        requestBody.put("password", "invalid");
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/login")
                .contentType("application/json")
                .content(jsonBody);


        //then
        MockHttpServletResponse response = mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        requestFields(
                                fieldWithPath("username").type(JsonFieldType.STRING).description("아이디"),
                                fieldWithPath("password").type(JsonFieldType.STRING).description("패스워드")
                        )))
                .andReturn()
                .getResponse();
        assertThat(response.getContentAsString()).contains("NOT_FOUND_USER");
    }


    @Test
    void 전체조회() throws Exception {

        // TODO ADMIN 권한이 사용자 조회
        // TODO FIX: Filter를 통과한 사용자가 사용자 조회


        MockHttpServletResponse response = login();

        String accessToken = Objects.requireNonNull(response.getCookie("AccessToken")).getValue();
        String refreshToken = Objects.requireNonNull(response.getCookie("RefreshToken")).getValue();

        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/users")
                .header("AccessToken", "Bearer " + accessToken)
                .header("RefreshToken", "Bearer " + refreshToken);

        MockHttpServletResponse responseByUsers = mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        responseFields(
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("시간"),
                                fieldWithPath("status").type(JsonFieldType.STRING).description("상태"),
                                fieldWithPath("message").type(JsonFieldType.STRING).description("메세지"),
                                fieldWithPath("data[].id").type(JsonFieldType.NUMBER).description("id"),
                                fieldWithPath("data[].username").type(JsonFieldType.STRING).description("username"),
                                fieldWithPath("data[].nickname").type(JsonFieldType.STRING).description("nickname"),
                                fieldWithPath("data[].roles").type(JsonFieldType.ARRAY).description("권한")
                        )
                ))
                .andReturn()
                .getResponse();

        List<User> users = repository.findAll();

        int dataSize = objectMapper.readTree(responseByUsers.getContentAsString()).get("data").size();
        assertThat(users.size()).isEqualTo(dataSize);

    }

    @Test
    void 개별조회() throws Exception {
        // TODO ADMIN 권한이 사용자 조회
        // TODO USER 권한이 본인정보 사용자 조회

        MockHttpServletResponse response = login();

        String accessToken = Objects.requireNonNull(response.getCookie("AccessToken")).getValue();
        String refreshToken = Objects.requireNonNull(response.getCookie("RefreshToken")).getValue();

        List<User> userList = repository.findAll();
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/users/" + userList.get(0).getId())
                .header("AccessToken", "Bearer " + accessToken)
                .header("RefreshToken", "Bearer " + refreshToken);

        MockHttpServletResponse responseByUsers = mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse();

        String username = objectMapper.readTree(responseByUsers.getContentAsString()).get("data").get("username").asText();
//        String username = objectMapper.readValue(responseByUsers.getContentAsString(), User.class).getUsername();
        assertThat(userList.get(0).getUsername()).isEqualTo(username);
    }

    // TODO 여기서부터는 Role에 대한 Authorization이 필요함.
    @Test
    void 개별조회_권한없음_예외처리() {
        // TODO USER 권한이 다른 사용자 조회 및 수정 및 삭제 예외처리

    }

    @Test
    void 비밀번호수정() {
        // TODO ADMIN 권한이 타사용자 비밀번호 변경
        // TODO USER 권한이 본인 비밀번호 변경
    }

    @Test
    void 삭제() {
        // TODO ADMIN 권한이 타사용자 삭제
        // TODO USER 권한이 본인 삭제
    }

//    @Test
    void HOTFIX_6_initialization_role_and_user() {
        roleRepository.deleteAll();
        userRepository.deleteAll();
        userGroupRepository.deleteAll();

        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        Role adminRole = Role.builder()
                .name("ADMIN")
                .build();
        Role savedAdminRole = roleRepository.save(adminRole);

        Role userRole = Role.builder()
                .name("USER")
                .build();
        Role savedUserRole = roleRepository.save(userRole);

        User user = User.builder()
                .userGroup(userGroup)
                .username("admin")
                .password(passwordEncoder.encode("1234"))
                .nickname("admin")
                .role(savedAdminRole)
                .build();

        UserAuthority userRoleOfUser = UserAuthority.builder()
                .user(user)
                .role(savedUserRole)
                .build();
        user.addUserRole(userRoleOfUser);
        userRepository.save(user);

        em.flush();
        em.clear();

        User userByDb = userRepository.findById(user.getId()).orElseThrow();
        assertThat(userByDb.getUsername()).isEqualTo("admin");
        assertThat(userByDb.getNickname()).isEqualTo("admin");
        assertThat(passwordEncoder.matches("1234", userByDb.getPassword())).isTrue();
        assertThat(userByDb.getUserRoles().stream().map(UserAuthority::getRole).map(Role::getName).collect(Collectors.toList())).contains("ADMIN", "USER");
        assertThat(userByDb.getUserRoles()).hasSize(2);

    }

//    @Test
    void HOTFIX_6_initialization_role_and_user_Service_Layer() {
        roleRepository.deleteAll();
        userRepository.deleteAll();
        userGroupRepository.deleteAll();

        Long userGroupId = cd.createUserGroup();
        RoleRequestDto adminRoleRequestDto = RoleRequestDto.builder()
                .name("ADMIN")
                .build();

        RoleResponseDto adminRoleResponseDto = roleService.save(adminRoleRequestDto);

        RoleRequestDto userRoleRequestDto = RoleRequestDto.builder()
                .name("USER")
                .build();


        UserRequestDto userRequestDto = UserRequestDto.builder()
                .userGroupId(userGroupId)
                .username("admin")
                .password("1234")
                .nickname("관리자")
                .roleIds(Set.of(adminRoleResponseDto.id()))
                .build();
        UserResponseDTO userResponseDto = userService.save(userRequestDto);
        User userByDb = userRepository.findById(userResponseDto.id()).orElseThrow();


        RoleResponseDto userRoleResponseDto = roleService.save(userRoleRequestDto);
        Role userRole = roleRepository.findById(userRoleResponseDto.id()).orElseThrow();
        userByDb.addUserRole(UserAuthority.builder()
                .user(userByDb)
                .role(userRole)
                .build());

        em.flush();
        em.clear();

        assertThat(userByDb.getUsername()).isEqualTo("admin");
        assertThat(userByDb.getNickname()).isEqualTo("관리자");
        assertThat(passwordEncoder.matches("1234", userByDb.getPassword())).isTrue();
        assertThat(userByDb.getUserRoles().stream().map(UserAuthority::getRole).map(Role::getName).collect(Collectors.toList())).contains("ADMIN", "USER");
//        assertThat(userByDb.getUserRoles()).hasSize(2);
    }

    private MockHttpServletResponse login() throws Exception {
        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        User user = User.builder()
                .userGroup(userGroup)
                .username("test")
                .password(passwordEncoder.encode("test"))
                .nickname("test")
                .build();
        repository.save(user);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("username", "test");
        requestBody.put("password", "test");
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/login")
                .contentType("application/json")
                .content(jsonBody);

        return mockMvc.perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse();
    }
}
