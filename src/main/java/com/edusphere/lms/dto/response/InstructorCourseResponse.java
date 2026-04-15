package com.edusphere.lms.dto.response;

import com.edusphere.lms.enums.CourseStatus;

public record InstructorCourseResponse(
        String courseId,
        String title,
        String description,
        CourseStatus status
) {
}
