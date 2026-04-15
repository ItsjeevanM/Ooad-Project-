package com.edusphere.lms.dto.response;

import java.time.Instant;

import com.edusphere.lms.enums.SubmissionStatus;

public record InstructorSubmissionResponse(
        String submissionId,
        String assignmentId,
        String studentId,
        String content,
        Instant submittedAt,
        SubmissionStatus status
) {
}
