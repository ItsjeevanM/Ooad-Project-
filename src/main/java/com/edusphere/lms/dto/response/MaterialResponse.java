package com.edusphere.lms.dto.response;

import java.time.Instant;

public record MaterialResponse(
        String materialId,
        String title,
        String fileUrl,
        String courseId,
        String uploadedBy,
        Instant createdAt
) {
}
