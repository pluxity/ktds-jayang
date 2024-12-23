package com.pluxity.ktds.global.security;

import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_USER;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    public CustomUserDetailsService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = repository.findByUsername(username).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        return new CustomUserDetails(user);
    }
}
