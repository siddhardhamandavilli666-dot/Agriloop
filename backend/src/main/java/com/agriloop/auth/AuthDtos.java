package com.agriloop.auth;

public class AuthDtos {

    public record RegisterRequest(
            String name,
            String email,
            String password,
            String role,
            String phone
    ) {}

    public record LoginRequest(String email, String password) {}

    public record UserResponse(
            Long id,
            String name,
            String email,
            String role,
            String phone
    ) {}

    public record AuthResponse(String token, UserResponse user) {}
}
