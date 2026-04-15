package com.edusphere.lms.service;

import java.util.Locale;

import org.springframework.stereotype.Service;

import com.edusphere.lms.dto.request.LoginRequest;
import com.edusphere.lms.dto.request.RegisterRequest;
import com.edusphere.lms.dto.response.LoginResponse;
import com.edusphere.lms.dto.response.RegisterResponse;
import com.edusphere.lms.dto.response.UserProfileResponse;
import com.edusphere.lms.entity.User;
import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.UserStatus;
import com.edusphere.lms.exception.ResourceNotFoundException;
import com.edusphere.lms.exception.UnauthorizedException;
import com.edusphere.lms.repository.UserRepository;
import com.edusphere.lms.security.JwtProvider;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public AuthService(UserRepository userRepository, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if (request.role() == Role.ADMIN) {
            throw new UnauthorizedException("Admin role cannot be self-registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(request.password());
        user.setRole(request.role());
        user.setStatus(UserStatus.ACTIVE);
        user.setCollegeId(request.collegeId() != null ? request.collegeId().trim() : null);

        User savedUser = userRepository.save(user);
        return new RegisterResponse(toUserProfile(savedUser));
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        // Step 1: find user by email
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Step 2: compare password directly (plain text)
        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Step 3: check if account is active
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is not active");
        }

        // Step 4: generate token
        String token = jwtProvider.generateToken(user.getEmail(), user.getRole());

        // Step 5: return response
        return new LoginResponse(token, "Bearer", jwtProvider.getExpiryMs(), toUserProfile(user));
    }

    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserProfile(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UserProfileResponse toUserProfile(User user) {
        return new UserProfileResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCollegeId()
        );
    }
}
