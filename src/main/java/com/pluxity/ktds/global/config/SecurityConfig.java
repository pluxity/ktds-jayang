package com.pluxity.ktds.global.config;

import com.pluxity.ktds.global.security.CustomUserDetailsService;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
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
    public SecurityFilterChain filterChain(HttpSecurity http, CustomUserDetailsService customUserDetailsService) throws Exception {
        http.csrf().disable().cors().disable()
                .authorizeHttpRequests(request -> request
                        .dispatcherTypeMatchers(DispatcherType.FORWARD).permitAll()
                        .requestMatchers(
                                "/status/**",
                                "/resources/**",
                                "/error",
                                "/login",
                                "/login/**",
                                "/auth/**",
                                "/h2-console/**",
                                "/static/**",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/webjars/**",
                                "/vms-event"
                        ).permitAll()
                        .anyRequest().authenticated()	// 어떠한 요청이라도 인증필요
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

            var context = SecurityContextHolder.getContext();
            Authentication auth = context.getAuthentication();
            boolean needRestore = (auth == null
                    || auth instanceof AnonymousAuthenticationToken
                    || "anonymousUser".equals(auth.getName()));


            if (req.getCookies() != null) {
                for (Cookie c : req.getCookies()) {
                    log.debug("쿠키: {} = {}", c.getName(), c.getValue());
                }

                Arrays.stream(req.getCookies())
                        .filter(c -> {
                            log.debug("검사 중인 쿠키 이름: {}", c.getName());
                            return "USER_ID".equals(c.getName());
                        })
                        .findFirst()
                        .ifPresent(c -> {
                            try {
                                String username = c.getValue();
                                log.debug("USER_ID 쿠키 발견, username={}", username);

                                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                                UsernamePasswordAuthenticationToken token =
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                                var newContext = SecurityContextHolder.createEmptyContext();
                                newContext.setAuthentication(token);
                                SecurityContextHolder.setContext(newContext);

                                SecurityContextRepository repo = new HttpSessionSecurityContextRepository();
                                repo.saveContext(newContext, req, res);

                                log.debug("SecurityContext 복원 완료: {}", username);
                            } catch (Exception ex) {
                                log.warn("USER_ID 쿠키 인증 복원 실패: {}", ex.getMessage());
                            }
                        });
            }

            chain.doFilter(request, response);
        }, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
