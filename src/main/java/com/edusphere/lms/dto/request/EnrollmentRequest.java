package com.edusphere.lms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EnrollmentRequest(
        @NotBlank(message = "Course ID is required")
        String courseId
) {
}
