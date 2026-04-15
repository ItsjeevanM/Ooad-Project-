package com.edusphere.lms.dto.request;

import java.time.Instant;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateAssignmentRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 180, message = "Title must not exceed 180 characters")
        String title,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        @NotNull(message = "Due date is required")
        @Future(message = "Due date must be in the future")
        Instant dueDate
) {
}
