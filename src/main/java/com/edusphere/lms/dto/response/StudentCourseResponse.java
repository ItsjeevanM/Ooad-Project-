package com.edusphere.lms.dto.response;

import com.edusphere.lms.enums.CourseStatus;
import com.edusphere.lms.enums.EnrollmentStatus;

public record StudentCourseResponse(
        String enrollmentId,
        String courseId,
        String title,
        String description,
        String instructorId,
        CourseStatus courseStatus,
        EnrollmentStatus enrollmentStatus
) {
}
