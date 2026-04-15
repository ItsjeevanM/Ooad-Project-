package com.edusphere.lms.repository;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    Page<Assignment> findByCourseIdIn(Collection<String> courseIds, Pageable pageable);

    Page<Assignment> findByCourseId(String courseId, Pageable pageable);

    Optional<Assignment> findByAssignmentIdAndCourseId(String assignmentId, String courseId);
}
