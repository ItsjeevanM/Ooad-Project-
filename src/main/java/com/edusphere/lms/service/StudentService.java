package com.edusphere.lms.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.edusphere.lms.dto.response.PagedResponse;
import com.edusphere.lms.dto.response.StudentAssignmentResponse;
import com.edusphere.lms.dto.response.StudentAttendanceResponse;
import com.edusphere.lms.dto.response.StudentCourseResponse;
import com.edusphere.lms.dto.response.StudentMarksResponse;
import com.edusphere.lms.entity.Assignment;
import com.edusphere.lms.entity.Attendance;
import com.edusphere.lms.entity.Course;
import com.edusphere.lms.entity.Enrollment;
import com.edusphere.lms.entity.Marks;
import com.edusphere.lms.entity.Submission;
import com.edusphere.lms.entity.User;
import com.edusphere.lms.dto.request.EnrollmentRequest;
import com.edusphere.lms.dto.response.ApiResponse;
import com.edusphere.lms.enums.CourseStatus;
import com.edusphere.lms.enums.EnrollmentStatus;
import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.UserStatus;
import com.edusphere.lms.exception.ResourceNotFoundException;
import com.edusphere.lms.exception.UnauthorizedException;
import com.edusphere.lms.repository.AssignmentRepository;
import com.edusphere.lms.repository.AttendanceRepository;
import com.edusphere.lms.repository.CourseRepository;
import com.edusphere.lms.repository.EnrollmentRepository;
import com.edusphere.lms.repository.MarksRepository;
import com.edusphere.lms.repository.SubmissionRepository;
import com.edusphere.lms.repository.UserRepository;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;

    public StudentService(
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            MarksRepository marksRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.marksRepository = marksRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public PagedResponse<StudentCourseResponse> getEnrolledCourses(
            String email,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User student = getActiveStudent(email);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatusNot(
                student.getUserId(),
                EnrollmentStatus.DROPPED,
                pageable
        );

        List<String> courseIds = enrollments.getContent().stream().map(Enrollment::getCourseId).toList();
        Map<String, Course> coursesById = courseIds.isEmpty()
                ? Collections.emptyMap()
                : courseRepository.findByCourseIdIn(courseIds)
                .stream()
                .collect(Collectors.toMap(Course::getCourseId, Function.identity()));

        List<StudentCourseResponse> content = enrollments.getContent().stream().map(enrollment -> {
            Course course = coursesById.get(enrollment.getCourseId());
            if (course == null) {
                return new StudentCourseResponse(
                        enrollment.getEnrollmentId(),
                        enrollment.getCourseId(),
                        "Unknown Course",
                        "Course details unavailable",
                        null,
                        null,
                        enrollment.getStatus()
                );
            }
            return new StudentCourseResponse(
                    enrollment.getEnrollmentId(),
                    course.getCourseId(),
                    course.getTitle(),
                    course.getDescription(),
                    course.getInstructorId(),
                    course.getStatus(),
                    enrollment.getStatus()
            );
        }).toList();

        return toPagedResponse(enrollments, content);
    }

    public PagedResponse<StudentAssignmentResponse> getAssignments(
            String email,
            String courseId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User student = getActiveStudent(email);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        if (courseId != null) {
            verifyEnrollment(student.getUserId(), courseId);
        }

        List<String> enrolledCourseIds = getEnrolledCourseIds(student.getUserId());
        if (enrolledCourseIds.isEmpty()) {
            return toPagedResponse(Page.empty(pageable), List.of());
        }

        Page<Assignment> assignments = courseId == null
                ? assignmentRepository.findByCourseIdIn(enrolledCourseIds, pageable)
                : assignmentRepository.findByCourseId(courseId, pageable);

        List<String> assignmentIds = assignments.getContent().stream().map(Assignment::getAssignmentId).toList();
        Map<String, Submission> submissionsByAssignment = assignmentIds.isEmpty()
                ? Collections.emptyMap()
                : submissionRepository.findByStudentIdAndAssignmentIdIn(student.getUserId(), assignmentIds)
                .stream()
                .collect(Collectors.toMap(Submission::getAssignmentId, Function.identity(), (first, second) -> first));

        List<StudentAssignmentResponse> content = assignments.getContent().stream()
                .map(assignment -> {
                    Submission submission = submissionsByAssignment.get(assignment.getAssignmentId());
                    return new StudentAssignmentResponse(
                            assignment.getAssignmentId(),
                            assignment.getCourseId(),
                            assignment.getTitle(),
                            assignment.getDescription(),
                            assignment.getDueDate(),
                            submission == null ? null : submission.getSubmissionId(),
                            submission == null ? null : submission.getStatus(),
                            submission == null ? null : submission.getSubmittedAt()
                    );
                }).toList();

        return toPagedResponse(assignments, content);
    }

    public PagedResponse<StudentMarksResponse> getMarks(
            String email,
            String courseId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User student = getActiveStudent(email);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        if (courseId != null) {
            verifyEnrollment(student.getUserId(), courseId);
        }

        List<String> enrolledCourseIds = getEnrolledCourseIds(student.getUserId());
        if (enrolledCourseIds.isEmpty()) {
            return toPagedResponse(Page.empty(pageable), List.of());
        }

        Page<Marks> marksPage = courseId == null
                ? marksRepository.findByStudentIdAndCourseIdIn(student.getUserId(), enrolledCourseIds, pageable)
                : marksRepository.findByStudentIdAndCourseId(student.getUserId(), courseId, pageable);

        List<StudentMarksResponse> content = marksPage.getContent().stream().map(marks -> {
            Double percentage = (marks.getMaxScore() == null || marks.getMaxScore() == 0 || marks.getScore() == null)
                    ? null
                    : (marks.getScore() * 100.0) / marks.getMaxScore();

            return new StudentMarksResponse(
                    marks.getMarkId(),
                    marks.getCourseId(),
                    marks.getAssignmentId(),
                    marks.getScore(),
                    marks.getMaxScore(),
                    percentage,
                    marks.getGradedBy()
            );
        }).toList();

        return toPagedResponse(marksPage, content);
    }

    public PagedResponse<StudentAttendanceResponse> getAttendance(
            String email,
            String courseId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User student = getActiveStudent(email);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        if (courseId != null) {
            verifyEnrollment(student.getUserId(), courseId);
        }

        List<String> enrolledCourseIds = getEnrolledCourseIds(student.getUserId());
        if (enrolledCourseIds.isEmpty()) {
            return toPagedResponse(Page.empty(pageable), List.of());
        }

        Page<Attendance> attendancePage = courseId == null
                ? attendanceRepository.findByStudentIdAndCourseIdIn(student.getUserId(), enrolledCourseIds, pageable)
                : attendanceRepository.findByStudentIdAndCourseId(student.getUserId(), courseId, pageable);

        List<String> attendanceCourseIds = attendancePage.getContent().stream()
                .map(Attendance::getCourseId)
                .distinct()
                .toList();

        Map<String, Course> coursesById = courseRepository.findByCourseIdIn(attendanceCourseIds).stream()
                .collect(Collectors.toMap(Course::getCourseId, Function.identity()));

        List<StudentAttendanceResponse> content = attendancePage.getContent().stream().map(attendance -> {
            Course course = coursesById.get(attendance.getCourseId());
            return new StudentAttendanceResponse(
                    attendance.getAttendanceId(),
                    attendance.getCourseId(),
                    course != null ? course.getTitle() : "Unknown Course",
                    attendance.getSessionDate(),
                    attendance.getStatus()
            );
        }).toList();

        return toPagedResponse(attendancePage, content);
    }

    public List<StudentCourseResponse> getAvailableCourses(String email) {
        User student = getActiveStudent(email);
        
        // Get all active courses
        List<Course> activeCourses = courseRepository.findByStatus(CourseStatus.ACTIVE);
        
        // Get student's enrolled course IDs (excluding dropped)
        List<String> enrolledCourseIds = getEnrolledCourseIds(student.getUserId());
        
        // Filter out already enrolled courses
        return activeCourses.stream()
                .filter(course -> !enrolledCourseIds.contains(course.getCourseId()))
                .map(course -> new StudentCourseResponse(
                        null,
                        course.getCourseId(),
                        course.getTitle(),
                        course.getDescription(),
                        course.getInstructorId(),
                        course.getStatus(),
                        null
                ))
                .toList();
    }

    public ApiResponse<Void> enrollInCourse(String email, String courseId) {
        User student = getActiveStudent(email);
        
        // Check if course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        
        // Check if course is active
        if (course.getStatus() != CourseStatus.ACTIVE) {
            throw new ResourceNotFoundException("Course is not available for enrollment");
        }
        
        // Check if already enrolled
        boolean alreadyEnrolled = enrollmentRepository.existsByStudentIdAndCourseIdAndStatusNot(
                student.getUserId(),
                courseId,
                EnrollmentStatus.DROPPED
        );
        
        if (alreadyEnrolled) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }
        
        // Create new enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setEnrollmentId(UUID.randomUUID().toString());
        enrollment.setStudentId(student.getUserId());
        enrollment.setCourseId(courseId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        
        enrollmentRepository.save(enrollment);
        
        return ApiResponse.success("Successfully enrolled in course", null);
    }

    private List<String> getEnrolledCourseIds(String studentId) {
        return enrollmentRepository.findByStudentIdAndStatusNot(studentId, EnrollmentStatus.DROPPED)
                .stream()
                .map(Enrollment::getCourseId)
                .distinct()
                .toList();
    }

    private void verifyEnrollment(String studentId, String courseId) {
        boolean enrolled = enrollmentRepository.existsByStudentIdAndCourseIdAndStatusNot(
                studentId,
                courseId,
                EnrollmentStatus.DROPPED
        );
        if (!enrolled) {
            throw new ResourceNotFoundException("Enrollment not found for course: " + courseId);
        }
    }

    private User getActiveStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new UnauthorizedException("Student access is required");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Student account is not active");
        }
        return user;
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private <T> PagedResponse<T> toPagedResponse(Page<?> page, List<T> content) {
        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
