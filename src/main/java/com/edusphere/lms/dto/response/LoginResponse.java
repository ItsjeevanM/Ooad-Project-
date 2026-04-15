package com.edusphere.lms.dto.response;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UserProfileResponse user
) {
}
