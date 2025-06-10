package com.pluxity.ktds.domains.user_role.domain;

import com.pluxity.ktds.CreateDomain;
import com.pluxity.ktds.domains.user.entity.Role;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.dto.UserRequestDto;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.repository.RoleRepository;
import com.pluxity.ktds.domains.user.repository.UserGroupRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.domains.user.repository.UserRoleRepository;
import com.pluxity.ktds.domains.user.service.UserService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class UserRoleTest {

    public static final String TEST_USERNAME = "test";
    public static final String TEST_PASSWORD = "test";
    public static final String TEST_NICKNAME = "test";
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    UserGroupRepository userGroupRepository;
    @Autowired
    UserRoleRepository userRoleRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    CreateDomain cd;
    @Autowired
    EntityManager em;

    @Test
    void save() {
        Long userGroupId = cd.createUserGroup();
        UserGroup userGroup = userGroupRepository.findById(userGroupId).orElseThrow();
        User userBuilder = User.builder()
                .username("test")
                .password(passwordEncoder.encode("test"))
                .nickname("test")
                .userGroup(userGroup)
                .build();
        User user = userRepository.save(userBuilder);
        Role roleBuilder = Role.builder()
                .name("test")
                .build();
        Role role = roleRepository.save(roleBuilder);

        UserAuthority userRole = UserAuthority.builder()
                .user(user)
                .role(role)
                .build();
        UserAuthority fetchUserRole = userRoleRepository.save(userRole);

        assertThat(fetchUserRole.getUser().getId()).isEqualTo(user.getId());
        assertThat(fetchUserRole.getUser().getUsername()).isEqualTo(user.getUsername());
        assertThat(fetchUserRole.getUser().getNickname()).isEqualTo(user.getNickname());
        assertThat(fetchUserRole.getUser().getUserGroup().getId()).isEqualTo(userGroup.getId());
        assertThat(fetchUserRole.getUser().getUserGroup().getName()).isEqualTo(userGroup.getName());
        assertThat(fetchUserRole.getRole().getName()).isEqualTo(role.getName());
        assertThat(fetchUserRole.getRole().getId()).isEqualTo(role.getId());


    }

    @Test
    void saveUserWithUserRoleShouldPersistUserRole() {
        //given
        Long roleId = cd.createRole();
        Role role = roleRepository.findById(roleId).orElseThrow();
        UserRequestDto userRequestDto = UserRequestDto.builder()
                .username(TEST_USERNAME)
                .password(TEST_PASSWORD)
                .nickname(TEST_NICKNAME)
                .roleIds(Set.of(roleId))
                .build();

        //when
        UserResponseDTO userResponseDto = userService.save(userRequestDto);
        User user = userRepository.findById(userResponseDto.id()).orElseThrow();

        //then
        assertThat(user.getUsername()).isEqualTo(TEST_USERNAME);
        assertThat(passwordEncoder.matches(TEST_PASSWORD, user.getPassword())).isTrue();
        assertThat(user.getNickname()).isEqualTo(TEST_NICKNAME);

        ArrayList<UserAuthority> userRoles = new ArrayList<>(user.getUserRoles());
        assertThat(userRoles).hasSize(1);
        userRoles.forEach(userRole -> {
            assertThat(userRole.getUser().getId()).isEqualTo(user.getId());
            assertThat(userRole.getRole().getId()).isEqualTo(role.getId());
            assertThat(userRole.getRole().getName()).isEqualTo(role.getName());
        });
    }

    @Test
    void shouldUpdateRole() {
        //given
        Long userGroupId = cd.createUserGroup();
        Long roleId1 = cd.createRole();

        UserRequestDto userRequestDto = UserRequestDto.builder()
                .userGroupId(userGroupId)
                .username(TEST_USERNAME)
                .password(TEST_PASSWORD)
                .nickname(TEST_NICKNAME)
                .roleIds(Set.of(roleId1))
                .build();
        UserResponseDTO userResponseDto = userService.save(userRequestDto);

        //when
        Long roleId2 = cd.createRole();
        Role newRole = roleRepository.findById(roleId2).orElseThrow();

        UserRequestDto newRoleUserRequestDto = UserRequestDto.builder()
                .roleIds(Set.of(roleId2))
                .build();
        userService.update(userResponseDto.id(), newRoleUserRequestDto);

        //then
        User user = userRepository.findById(userResponseDto.id()).orElseThrow();
        assertThat(user.getUserRoles()).hasSize(1);
        assertThat(user.getUserRoles().stream().findAny().get().getRole().getId()).isEqualTo(newRole.getId());
    }

    @Test
    void ShouldSaveUserWithMultipleRoles() {
        //given
        Long userGroupId = cd.createUserGroup();
        Long roleId1 = cd.createRole();
        Long roleId2 = cd.createRole();
        Role role1 = roleRepository.findById(roleId1).orElseThrow();
        Role role2 = roleRepository.findById(roleId2).orElseThrow();
        UserRequestDto userRequestDto = UserRequestDto.builder()
                .userGroupId(userGroupId)
                .username(TEST_USERNAME)
                .password(TEST_PASSWORD)
                .nickname(TEST_NICKNAME)
                .roleIds(Set.of(roleId1, roleId2))
                .build();

        //when
        UserResponseDTO userResponseDto = userService.save(userRequestDto);
        User user = userRepository.findById(userResponseDto.id()).orElseThrow();

        //then
        assertThat(user.getUserRoles()).hasSize(2);
        assertThat(user.getUserRoles().stream().map(UserAuthority::getRole)).containsOnly(role1, role2);
    }

    @Test
    void removeRoleOfUser() {
        // given
        Long userGroupId = cd.createUserGroup();
        Long roleId1 = cd.createRole();
        Long roleId2 = cd.createRole();
        Role role1 = roleRepository.findById(roleId1).orElseThrow();
        UserRequestDto userRequestDto = UserRequestDto.builder()
                .userGroupId(userGroupId)
                .username(TEST_USERNAME)
                .password(TEST_PASSWORD)
                .nickname(TEST_NICKNAME)
                .roleIds(Set.of(roleId1, roleId2))
                .build();

        // when
        UserResponseDTO userResponseDto = userService.save(userRequestDto);
        User user = userRepository.findById(userResponseDto.id()).orElseThrow();
        assertThat(user.getUserRoles()).hasSize(2);
        user.removeRole(role1);

        // then
        user = userRepository.findById(userResponseDto.id()).orElseThrow();
        assertThat(user.getUserRoles()).hasSize(1);
        assertThat(user.getUserRoles().stream().findAny().get().getRole().getId()).isEqualTo(roleId2);
    }

    @Test
    void deleteUserRole() {
        // given
        Long userGroupId = cd.createUserGroup();
        Long roleId = cd.createRole();
        Role role = roleRepository.findById(roleId).orElseThrow();
        UserRequestDto userRequestDto = UserRequestDto.builder()
                .userGroupId(userGroupId)
                .username(TEST_USERNAME)
                .password(TEST_PASSWORD)
                .nickname(TEST_NICKNAME)
                .roleIds(Set.of(roleId))
                .build();

        // when
        UserResponseDTO userResponseDto = userService.save(userRequestDto);
        User user = userRepository.findById(userResponseDto.id()).orElseThrow();
        assertThat(user.getUserRoles()).hasSize(1);
        UserAuthority userRole = user.getUserRoles().stream().findAny().get();
        user.getUserRoles().remove(userRole);
        userRepository.save(user);
        roleRepository.save(role);

        // then
        user = userRepository.findById(userResponseDto.id()).orElseThrow();
        assertThat(user.getUserRoles()).isEmpty();
    }


}