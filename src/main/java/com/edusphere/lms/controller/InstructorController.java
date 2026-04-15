package com.edusphere.lms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edusphere.lms.dto.request.CreateAssignmentRequest;
import com.edusphere.lms.dto.request.GradeSubmissionRequest;
import com.edusphere.lms.dto.request.MarkAttendanceRequest;
import com.edusphere.lms.dto.request.UpdateAssignmentRequest;
import com.edusphere.lms.dto.response.ApiResponse;
import com.edusphere.lms.dto.response.AttendanceMarkResponse;
import com.edusphere.lms.dto.response.InstructorAssignmentResponse;
import com.edusphere.lms.dto.response.InstructorCourseResponse;
import com.edusphere.lms.dto.response.InstructorSubmissionResponse;
import com.edusphere.lms.dto.response.PagedResponse;
import com.edusphere.lms.service.InstructorService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/v1/instructors/me")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorController {

    private final InstructorService instructorService;

    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PagedResponse<InstructorCourseResponse>>> getMyCourses(
            Authentication authentication,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "enrolledAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<InstructorCourseResponse> response = instructorService.getMyCourses(
                authentication.getName(),
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Instructor courses fetched", response));
    }

    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<ApiResponse<PagedResponse<InstructorAssignmentResponse>>> getAssignmentsForCourse(
            Authentication authentication,
            @PathVariable String courseId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PagedResponse<InstructorAssignmentResponse> response = instructorService.getAssignmentsForCourse(
                authentication.getName(),
                courseId,
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Course assignments fetched", response));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<InstructorAssignmentResponse>> createAssignment(
            Authentication authentication,
            @Valid @RequestBody CreateAssignmentRequest request
    ) {
        InstructorAssignmentResponse response = instructorService.createAssignment(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment created", response));
    }

    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<InstructorAssignmentResponse>> updateAssignment(
            Authentication authentication,
            @PathVariable String assignmentId,
            @Valid @RequestBody UpdateAssignmentRequest request
    ) {
        InstructorAssignmentResponse response = instructorService.updateAssignment(
                authentication.getName(),
                assignmentId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success("Assignment updated", response));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<ApiResponse<PagedResponse<InstructorSubmissionResponse>>> getSubmissionsByAssignment(
            Authentication authentication,
            @PathVariable String assignmentId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<InstructorSubmissionResponse> response = instructorService.getSubmissionsByAssignment(
                authentication.getName(),
                assignmentId,
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Submissions fetched", response));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<InstructorSubmissionResponse>> gradeSubmission(
            Authentication authentication,
            @PathVariable String submissionId,
            @Valid @RequestBody GradeSubmissionRequest request
    ) {
        InstructorSubmissionResponse response = instructorService.gradeSubmission(
                authentication.getName(),
                submissionId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success("Submission graded", response));
    }

    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceMarkResponse>> markAttendance(
            Authentication authentication,
            @Valid @RequestBody MarkAttendanceRequest request
    ) {
        AttendanceMarkResponse response = instructorService.markAttendance(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance recorded", response));
    }
}
