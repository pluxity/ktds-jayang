package com.pluxity.ktds.global.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsFilter(){
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("*", config);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable().cors().disable()
                .authorizeHttpRequests(request -> request
                        .dispatcherTypeMatchers(DispatcherType.FORWARD).permitAll()
                        .requestMatchers("/status/**","/resources/**","/error", "/login").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/static/js/**").permitAll()
                        .anyRequest().permitAll()	// 어떠한 요청이라도 인증필요
                )
                .formLogin(login -> login	// form 방식 로그인 사용
                                .loginPage("/login")
                                .successHandler((request, response, authentication) -> {
                                    boolean isAdmin = authentication.getAuthorities().stream().anyMatch(grantedAuthority -> "ADMIN".equals(grantedAuthority.getAuthority()));
                                    boolean isUser = authentication.getAuthorities().stream().anyMatch(grantedAuthority -> "USER".equals(grantedAuthority.getAuthority()));

                                    Cookie cookie = new Cookie("USER_ID", authentication.getName());
                                    response.addCookie(cookie);

                                    if (isAdmin) {
                                        response.sendRedirect("/admin/building/indoor");
                                    } else if (isUser) {
                                        response.sendRedirect("/viewer");
                                    }
                                })
                                .failureUrl("/login?error=true")
                )

                .logout().permitAll()
                .logoutUrl("/logout") // 로그아웃 URL (기본 값 : /logout)
                .logoutSuccessUrl("/login?logout=true") // 로그아웃 성공 URL (기본 값 : "/login?logout")
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout")) // 주소창에 요청해도 포스트로 인식하여 로그아웃
                .deleteCookies("JSESSIONID","USER_ID", "USER_ROLE") // 로그아웃 시 JSESSIONID 제거
                .invalidateHttpSession(true) // 로그아웃 시 세션 종료
                .clearAuthentication(true)// 로그아웃 시 권한 제거
                .and()
                .exceptionHandling()
                .accessDeniedPage("/accessDenied");

        http.headers().frameOptions().sameOrigin();
        http.addFilterBefore((request, response, chain) -> {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;

            Cookie[] cookies = req.getCookies();
            boolean isLoggedIn = false;

            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("USER_ID".equals(cookie.getName())) {
                        isLoggedIn = true;
                        break;
                    }
                }
            }

            if (isLoggedIn && req.getRequestURI().equals("/")) {
                res.sendRedirect("/viewer");
                return;
            }

            chain.doFilter(request, response);
        }, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
