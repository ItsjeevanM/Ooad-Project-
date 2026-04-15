package com.edusphere.lms.dto.response;

public record StudentMarksResponse(
        String markId,
        String courseId,
        String assignmentId,
        Double score,
        Double maxScore,
        Double percentage,
        String gradedBy
) {
}
