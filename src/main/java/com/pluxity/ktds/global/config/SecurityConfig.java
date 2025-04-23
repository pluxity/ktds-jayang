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

                .logout(logout -> logout
                        .permitAll()
                        .logoutUrl("/logout")
                        .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                        .deleteCookies("JSESSIONID", "USER_ID", "USER_ROLE")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .logoutSuccessHandler((request, response, authentication) -> {
                            String referer = request.getHeader("Referer");
                            if (referer != null && referer.contains("/kiosk")) {
                                response.sendRedirect("/kiosk-login?logout=true");
                            } else {
                                response.sendRedirect("/login?logout=true");
                            }
                        })
                )
                .exceptionHandling(ex -> ex
                        .accessDeniedPage("/accessDenied")
                );

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
