package com.edusphere.lms.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    Page<Attendance> findByStudentIdAndCourseIdIn(String studentId, Collection<String> courseIds, Pageable pageable);

    Page<Attendance> findByStudentIdAndCourseId(String studentId, String courseId, Pageable pageable);

    List<Attendance> findAllByStudentId(String studentId);

    Optional<Attendance> findByCourseIdAndStudentIdAndSessionDate(String courseId, String studentId, java.time.LocalDate sessionDate);
}
