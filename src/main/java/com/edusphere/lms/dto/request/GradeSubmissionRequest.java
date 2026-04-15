package com.edusphere.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record GradeSubmissionRequest(
        @NotNull(message = "Score is required")
        @PositiveOrZero(message = "Score must be zero or greater")
        Double score,

        @Size(max = 3000, message = "Feedback must not exceed 3000 characters")
        String feedback
) {
}
