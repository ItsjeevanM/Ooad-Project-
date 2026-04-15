package com.edusphere.lms.dto.response;

import java.time.Instant;

import com.edusphere.lms.enums.SubmissionStatus;

public record StudentAssignmentResponse(
        String assignmentId,
        String courseId,
        String title,
        String description,
        Instant dueDate,
        String submissionId,
        SubmissionStatus submissionStatus,
        Instant submittedAt
) {
}
