package com.edusphere.lms.repository;

import java.util.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Marks;

public interface MarksRepository extends JpaRepository<Marks, String> {
    Page<Marks> findByStudentIdAndCourseIdIn(String studentId, Collection<String> courseIds, Pageable pageable);

    Page<Marks> findByStudentIdAndCourseId(String studentId, String courseId, Pageable pageable);
}
