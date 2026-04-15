package com.edusphere.lms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edusphere.lms.dto.request.EnrollmentRequest;
import com.edusphere.lms.dto.response.ApiResponse;
import com.edusphere.lms.dto.response.PagedResponse;
import com.edusphere.lms.dto.response.StudentAssignmentResponse;
import com.edusphere.lms.dto.response.StudentAttendanceResponse;
import com.edusphere.lms.dto.response.StudentCourseResponse;
import com.edusphere.lms.dto.response.StudentMarksResponse;
import com.edusphere.lms.service.StudentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/v1/students/me")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PagedResponse<StudentCourseResponse>>> getEnrolledCourses(
            Authentication authentication,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "enrolledAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<StudentCourseResponse> response = studentService.getEnrolledCourses(
                authentication.getName(),
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Enrolled courses fetched", response));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<PagedResponse<StudentAssignmentResponse>>> getAssignments(
            Authentication authentication,
            @RequestParam(required = false) String courseId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PagedResponse<StudentAssignmentResponse> response = studentService.getAssignments(
                authentication.getName(),
                courseId,
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Assignments fetched", response));
    }

    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<PagedResponse<StudentMarksResponse>>> getMarks(
            Authentication authentication,
            @RequestParam(required = false) String courseId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "enrolledAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<StudentMarksResponse> response = studentService.getMarks(
                authentication.getName(),
                courseId,
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Marks fetched", response));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<PagedResponse<StudentAttendanceResponse>>> getAttendance(
            Authentication authentication,
            @RequestParam(required = false) String courseId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "sessionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<StudentAttendanceResponse> response = studentService.getAttendance(
                authentication.getName(),
                courseId,
                page,
                size,
                sortBy,
                sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Attendance fetched", response));
    }

    @GetMapping("/courses/available")
    public ResponseEntity<ApiResponse<java.util.List<StudentCourseResponse>>> getAvailableCourses(
            Authentication authentication
    ) {
        java.util.List<StudentCourseResponse> courses = studentService.getAvailableCourses(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Available courses fetched", courses));
    }

    @PostMapping("/courses/enroll")
    public ResponseEntity<ApiResponse<Void>> enrollInCourse(
            Authentication authentication,
            @Valid @RequestBody EnrollmentRequest request
    ) {
        ApiResponse<Void> response = studentService.enrollInCourse(authentication.getName(), request.courseId());
        return ResponseEntity.ok(response);
    }
}
