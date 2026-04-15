package com.edusphere.lms.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.edusphere.lms.entity.Attendance;
import com.edusphere.lms.entity.Course;
import com.edusphere.lms.entity.Enrollment;
import com.edusphere.lms.entity.Marks;
import com.edusphere.lms.entity.User;
import com.edusphere.lms.enums.AttendanceStatus;
import com.edusphere.lms.enums.CourseStatus;
import com.edusphere.lms.enums.EnrollmentStatus;
import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.UserStatus;
import com.edusphere.lms.repository.AttendanceRepository;
import com.edusphere.lms.repository.CourseRepository;
import com.edusphere.lms.repository.EnrollmentRepository;
import com.edusphere.lms.repository.MarksRepository;
import com.edusphere.lms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;

    public DataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            MarksRepository marksRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.marksRepository = marksRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public void run(String... args) {

        // Only insert if table is empty
        if (userRepository.count() > 0) return;

        User instructor = new User();
        instructor.setName("Dr. Raj Kumar");
        instructor.setEmail("rajkumar@edusphere.dev");
        instructor.setPassword("password123");
        instructor.setRole(Role.INSTRUCTOR);
        instructor.setStatus(UserStatus.ACTIVE);
        instructor.setCollegeId("COL001");
        instructor = userRepository.save(instructor);

        User student = new User();
        student.setName("Jeevan M");
        student.setEmail("jeevan@edusphere.dev");
        student.setPassword("password123");
        student.setRole(Role.STUDENT);
        student.setStatus(UserStatus.ACTIVE);
        student.setCollegeId("COL001");
        student = userRepository.save(student);

        // Create test courses
        Course course1 = new Course();
        course1.setTitle("Data Structures & Algorithms");
        course1.setDescription("Learn fundamental data structures including arrays, linked lists, trees, graphs and master algorithmic techniques for efficient problem-solving");
        course1.setInstructorId(instructor.getUserId());
        course1.setStatus(CourseStatus.ACTIVE);
        course1 = courseRepository.save(course1);

        Course course2 = new Course();
        course2.setTitle("Database Management System");
        course2.setDescription("Master relational databases, SQL queries, normalization, transaction management and database design principles");
        course2.setInstructorId(instructor.getUserId());
        course2.setStatus(CourseStatus.ACTIVE);
        course2 = courseRepository.save(course2);

        Course course3 = new Course();
        course3.setTitle("Compiler Design");
        course3.setDescription("Understand the principles of compiler construction including lexical analysis, parsing, semantic analysis and code generation");
        course3.setInstructorId(instructor.getUserId());
        course3.setStatus(CourseStatus.ACTIVE);
        course3 = courseRepository.save(course3);

        // Enroll student in courses
        Enrollment enroll1 = new Enrollment();
        enroll1.setStudentId(student.getUserId());
        enroll1.setCourseId(course1.getCourseId());
        enroll1.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enroll1);

        Enrollment enroll2 = new Enrollment();
        enroll2.setStudentId(student.getUserId());
        enroll2.setCourseId(course2.getCourseId());
        enroll2.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enroll2);

        Enrollment enroll3 = new Enrollment();
        enroll3.setStudentId(student.getUserId());
        enroll3.setCourseId(course3.getCourseId());
        enroll3.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enroll3);

        // Add marks for student
        Marks marks1 = new Marks();
        marks1.setStudentId(student.getUserId());
        marks1.setCourseId(course1.getCourseId());
        marks1.setScore(85.0);
        marks1.setMaxScore(100.0);
        marks1.setGradedBy(instructor.getUserId());
        marksRepository.save(marks1);

        Marks marks2 = new Marks();
        marks2.setStudentId(student.getUserId());
        marks2.setCourseId(course2.getCourseId());
        marks2.setScore(92.0);
        marks2.setMaxScore(100.0);
        marks2.setGradedBy(instructor.getUserId());
        marksRepository.save(marks2);

        Marks marks3 = new Marks();
        marks3.setStudentId(student.getUserId());
        marks3.setCourseId(course3.getCourseId());
        marks3.setScore(78.5);
        marks3.setMaxScore(100.0);
        marks3.setGradedBy(instructor.getUserId());
        marksRepository.save(marks3);

        // Add attendance records
        for (int i = 0; i < 20; i++) {
            Attendance att = new Attendance();
            att.setStudentId(student.getUserId());
            att.setCourseId(course1.getCourseId());
            att.setSessionDate(LocalDate.now().minusDays(20 - i));
            att.setStatus(i % 5 == 0 ? AttendanceStatus.ABSENT : (i % 3 == 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT));
            att.setMarkedBy(instructor.getUserId());
            attendanceRepository.save(att);
        }

        System.out.println("✅ Demo data initialized successfully");
        System.out.println("   Instructor: rajkumar@edusphere.dev / password123");
        System.out.println("   Student:    jeevan@edusphere.dev / password123");
        System.out.println("   ✓ 3 courses created and assigned");
        System.out.println("   ✓ Marks and attendance records added");
        System.out.println("   Courses:");
        System.out.println("     - Data Structures & Algorithms");
        System.out.println("     - Database Management System");
        System.out.println("     - Compiler Design");
    }
}