package com.edusphere.lms.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Course;
import com.edusphere.lms.enums.CourseStatus;

public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByCourseIdIn(Collection<String> courseIds);

    Page<Course> findByInstructorId(String instructorId, Pageable pageable);

    Optional<Course> findByCourseIdAndInstructorId(String courseId, String instructorId);

    List<Course> findByStatus(CourseStatus status);
}
