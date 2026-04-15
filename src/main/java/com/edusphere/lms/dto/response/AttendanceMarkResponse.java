package com.edusphere.lms.dto.response;

import java.time.LocalDate;

import com.edusphere.lms.enums.AttendanceStatus;

public record AttendanceMarkResponse(
        String attendanceId,
        String courseId,
        String studentId,
        LocalDate sessionDate,
        AttendanceStatus status,
        String markedBy
) {
}
