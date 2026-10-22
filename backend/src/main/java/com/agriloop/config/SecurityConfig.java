package com.agriloop.config;

import com.agriloop.auth.JwtAuthFilter;
import com.agriloop.auth.JwtService;
import com.agriloop.repo.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        private final JwtService jwtService;
        private final UserRepository userRepository;

        public SecurityConfig(JwtService jwtService, UserRepository userRepository) {
                this.jwtService = jwtService;
                this.userRepository = userRepository;
        }

        @Bean
        JwtAuthFilter jwtAuthFilter() {
                return new JwtAuthFilter(jwtService, userRepository);
        }

        @Bean
        SecurityFilterChain filterChain(HttpSecurity http)
                        throws Exception {
                return http
                                .csrf(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults())
                                .formLogin(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                                .httpBasic(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(authorize -> authorize
                                                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                                                .requestMatchers("/api/auth/**", "/api/auth/register",
                                                                "/api/auth/login")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/machinery", "/api/machinery/**")
                                                .permitAll()
                                                .anyRequest().permitAll())
                                .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
