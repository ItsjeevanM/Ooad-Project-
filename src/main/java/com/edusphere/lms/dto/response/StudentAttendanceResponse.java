package com.edusphere.lms.dto.response;

import java.time.LocalDate;

import com.edusphere.lms.enums.AttendanceStatus;

public record StudentAttendanceResponse(
        String attendanceId,
        String courseId,
        String courseName,
        LocalDate sessionDate,
        AttendanceStatus status
) {
}
