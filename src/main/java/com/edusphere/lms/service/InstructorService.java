package com.edusphere.lms.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.edusphere.lms.dto.request.CreateAssignmentRequest;
import com.edusphere.lms.dto.request.GradeSubmissionRequest;
import com.edusphere.lms.dto.request.MarkAttendanceRequest;
import com.edusphere.lms.dto.request.UpdateAssignmentRequest;
import com.edusphere.lms.dto.response.AttendanceMarkResponse;
import com.edusphere.lms.dto.response.InstructorAssignmentResponse;
import com.edusphere.lms.dto.response.InstructorCourseResponse;
import com.edusphere.lms.dto.response.InstructorSubmissionResponse;
import com.edusphere.lms.dto.response.PagedResponse;
import com.edusphere.lms.entity.Assignment;
import com.edusphere.lms.entity.Attendance;
import com.edusphere.lms.entity.Course;
import com.edusphere.lms.entity.Marks;
import com.edusphere.lms.entity.Submission;
import com.edusphere.lms.entity.User;
import com.edusphere.lms.enums.EnrollmentStatus;
import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.SubmissionStatus;
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
public class InstructorService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;

    public InstructorService(
            UserRepository userRepository,
            CourseRepository courseRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            EnrollmentRepository enrollmentRepository,
            AttendanceRepository attendanceRepository,
            MarksRepository marksRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
    }

    public PagedResponse<InstructorCourseResponse> getMyCourses(String email, int page, int size, String sortBy, String sortDir) {
        User instructor = getActiveInstructor(email);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Page<Course> coursePage = courseRepository.findByInstructorId(instructor.getUserId(), pageable);

        List<InstructorCourseResponse> content = coursePage.getContent().stream().map(course ->
                new InstructorCourseResponse(
                        course.getCourseId(),
                        course.getTitle(),
                        course.getDescription(),
                        course.getStatus()
                )
        ).toList();

        return toPagedResponse(coursePage, content);
    }

    public PagedResponse<InstructorAssignmentResponse> getAssignmentsForCourse(
            String email,
            String courseId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User instructor = getActiveInstructor(email);
        Course ownedCourse = getOwnedCourse(courseId, instructor.getUserId());

        Page<Assignment> assignmentPage = assignmentRepository.findByCourseId(
                ownedCourse.getCourseId(),
                buildPageable(page, size, sortBy, sortDir)
        );

        List<InstructorAssignmentResponse> content = assignmentPage.getContent().stream()
                .map(this::toInstructorAssignmentResponse)
                .toList();

        return toPagedResponse(assignmentPage, content);
    }

    public InstructorAssignmentResponse createAssignment(String email, CreateAssignmentRequest request) {
        User instructor = getActiveInstructor(email);
        Course ownedCourse = getOwnedCourse(request.courseId(), instructor.getUserId());

        Assignment assignment = new Assignment();
        assignment.setCourseId(ownedCourse.getCourseId());
        assignment.setTitle(request.title().trim());
        assignment.setDescription(request.description() == null ? null : request.description().trim());
        assignment.setDueDate(request.dueDate());
        assignment.setInstructorId(instructor.getUserId());

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return toInstructorAssignmentResponse(savedAssignment);
    }

    public InstructorAssignmentResponse updateAssignment(String email, String assignmentId, UpdateAssignmentRequest request) {
        User instructor = getActiveInstructor(email);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        getOwnedCourse(assignment.getCourseId(), instructor.getUserId());

        assignment.setTitle(request.title().trim());
        assignment.setDescription(request.description() == null ? null : request.description().trim());
        assignment.setDueDate(request.dueDate());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        return toInstructorAssignmentResponse(updatedAssignment);
    }

    public PagedResponse<InstructorSubmissionResponse> getSubmissionsByAssignment(
            String email,
            String assignmentId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User instructor = getActiveInstructor(email);
        Assignment assignment = getOwnedAssignment(assignmentId, instructor.getUserId());

        Page<Submission> submissionsPage = submissionRepository.findByAssignmentId(
                assignment.getAssignmentId(),
                buildPageable(page, size, sortBy, sortDir)
        );

        List<InstructorSubmissionResponse> content = submissionsPage.getContent().stream().map(this::toInstructorSubmissionResponse)
                .toList();

        return toPagedResponse(submissionsPage, content);
    }

    public InstructorSubmissionResponse gradeSubmission(String email, String submissionId, GradeSubmissionRequest request) {
        User instructor = getActiveInstructor(email);

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        getOwnedAssignment(submission.getAssignmentId(), instructor.getUserId());

        // Update submission status to GRADED
        submission.setStatus(SubmissionStatus.GRADED);
        submissionRepository.save(submission);

        // Create or update a mark record in the marks table
        Marks mark = new Marks();
        mark.setStudentId(submission.getStudentId());
        mark.setCourseId(null); // Could be derived from assignment if needed
        mark.setAssignmentId(submission.getAssignmentId());
        mark.setScore(request.score());
        mark.setGradedBy(instructor.getUserId());
        marksRepository.save(mark);

        return toInstructorSubmissionResponse(submission);
    }

    public AttendanceMarkResponse markAttendance(String email, MarkAttendanceRequest request) {
        User instructor = getActiveInstructor(email);
        getOwnedCourse(request.courseId(), instructor.getUserId());

        boolean enrolled = enrollmentRepository.existsByCourseIdAndStudentIdAndStatusNot(
                request.courseId(),
                request.studentId(),
                EnrollmentStatus.DROPPED
        );

        if (!enrolled) {
            throw new ResourceNotFoundException("Student is not enrolled in course: " + request.courseId());
        }

        Attendance attendance = attendanceRepository
                .findByCourseIdAndStudentIdAndSessionDate(request.courseId(), request.studentId(), request.sessionDate())
                .orElseGet(Attendance::new);

        attendance.setCourseId(request.courseId());
        attendance.setStudentId(request.studentId());
        attendance.setSessionDate(request.sessionDate());
        attendance.setStatus(request.status());
        attendance.setMarkedBy(instructor.getUserId());

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return new AttendanceMarkResponse(
                savedAttendance.getAttendanceId(),
                savedAttendance.getCourseId(),
                savedAttendance.getStudentId(),
                savedAttendance.getSessionDate(),
                savedAttendance.getStatus(),
                savedAttendance.getMarkedBy()
        );
    }

    private Assignment getOwnedAssignment(String assignmentId, String instructorId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        getOwnedCourse(assignment.getCourseId(), instructorId);
        return assignment;
    }

    private Course getOwnedCourse(String courseId, String instructorId) {
        return courseRepository.findByCourseIdAndInstructorId(courseId, instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for instructor: " + courseId));
    }

    private User getActiveInstructor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.INSTRUCTOR) {
            throw new UnauthorizedException("Instructor access is required");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Instructor account is not active");
        }

        return user;
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private InstructorAssignmentResponse toInstructorAssignmentResponse(Assignment assignment) {
        return new InstructorAssignmentResponse(
                assignment.getAssignmentId(),
                assignment.getCourseId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDueDate()
        );
    }

    private InstructorSubmissionResponse toInstructorSubmissionResponse(Submission submission) {
        return new InstructorSubmissionResponse(
                submission.getSubmissionId(),
                submission.getAssignmentId(),
                submission.getStudentId(),
                submission.getContent(),
                submission.getSubmittedAt(),
                submission.getStatus()
        );
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
