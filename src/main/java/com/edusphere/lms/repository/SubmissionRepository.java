package com.edusphere.lms.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByStudentIdAndAssignmentIdIn(String studentId, Collection<String> assignmentIds);

    Page<Submission> findByAssignmentId(String assignmentId, Pageable pageable);

    Optional<Submission> findBySubmissionIdAndAssignmentId(String submissionId, String assignmentId);
}
