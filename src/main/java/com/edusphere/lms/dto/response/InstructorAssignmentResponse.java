package com.edusphere.lms.dto.response;

import java.time.Instant;

public record InstructorAssignmentResponse(
        String assignmentId,
        String courseId,
        String title,
        String description,
        Instant dueDate
) {
}
