package com.edusphere.lms.dto.request;

import java.time.LocalDate;

import com.edusphere.lms.enums.AttendanceStatus;

import jakarta.validation.constraints.NotNull;

public record MarkAttendanceRequest(
        @NotNull(message = "Course ID is required")
        String courseId,

        @NotNull(message = "Student ID is required")
        String studentId,

        @NotNull(message = "Session date is required")
        LocalDate sessionDate,

        @NotNull(message = "Attendance status is required")
        AttendanceStatus status
) {
}
