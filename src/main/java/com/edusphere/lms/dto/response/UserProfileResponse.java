package com.edusphere.lms.dto.response;

import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.UserStatus;

public record UserProfileResponse(
        String userId,
        String name,
        String email,
        Role role,
        UserStatus status,
        String collegeId
) {
}
