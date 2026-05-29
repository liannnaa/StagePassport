package com.stagepassport.backend.config;

import com.stagepassport.backend.security.FirebaseAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public FirebaseAuthFilter firebaseAuthFilter() {
        return new FirebaseAuthFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            FirebaseAuthFilter firebaseAuthFilter
    ) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}