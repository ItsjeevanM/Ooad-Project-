package com.edusphere.lms.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Enrollment;
import com.edusphere.lms.enums.EnrollmentStatus;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    Page<Enrollment> findByStudentIdAndStatusNot(String studentId, EnrollmentStatus status, Pageable pageable);

    List<Enrollment> findByStudentIdAndStatusNot(String studentId, EnrollmentStatus status);

    boolean existsByStudentIdAndCourseIdAndStatusNot(String studentId, String courseId, EnrollmentStatus status);

    boolean existsByCourseIdAndStudentIdAndStatusNot(String courseId, String studentId, EnrollmentStatus status);
}
