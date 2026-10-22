package com.agriloop.auth;

import com.agriloop.model.AppUser;
import com.agriloop.repo.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(
            UserRepository users,
            PasswordEncoder encoder,
            JwtService jwt
    ) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(
            @RequestBody AuthDtos.RegisterRequest request
    ) {
        if (request.name() == null
                || request.name().isBlank()
                || request.email() == null
                || !request.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || request.password() == null
                || request.password().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a name, valid email and password of at least 8 characters"
            );
        }

        if (request.phone() == null
                || !request.phone().trim().matches("[6-9][0-9]{9}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid 10-digit Indian mobile number"
            );
        }

        String role = request.role() == null
                ? "FARMER"
                : request.role().toUpperCase(Locale.ROOT);
        if (!role.equals("FARMER") && !role.equals("OWNER")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Public registration is only available for Farmer or Owner"
            );
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole(role);
        user.setPhone(request.phone().trim());
        users.save(user);
        return response(user);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(
            @RequestBody AuthDtos.LoginRequest request
    ) {
        String email = request.email() == null ? "" : request.email().trim();
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (request.password() == null
                || !encoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        return response(user);
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse me(Authentication authentication) {
        AppUser user = users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();
        return user(user);
    }

    private AuthDtos.AuthResponse response(AppUser user) {
        return new AuthDtos.AuthResponse(
                jwt.generate(user.getEmail(), user.getRole()),
                user(user)
        );
    }

    private AuthDtos.UserResponse user(AppUser user) {
        return new AuthDtos.UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone()
        );
    }
}
