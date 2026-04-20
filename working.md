# EduSphere LMS - Complete Project Working Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [API Communication](#api-communication)
6. [Spring Boot Components](#spring-boot-components)
7. [Design Patterns](#design-patterns)
8. [SOLID Principles](#solid-principles)
9. [GRASP Patterns](#grasp-patterns)
10. [Important Considerations](#important-considerations)

---

## Project Overview

**EduSphere LMS** is a full-stack Learning Management System (LMS) application built with:

- **Frontend**: React 19 + Vite + Tailwind CSS + Zustand (State Management)
- **Backend**: Spring Boot 3.2.12 + Java 17
- **Database**: MySQL 8
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: RESTful API with stateless design

### Key Features
- User authentication (Register/Login)
- Role-based access control (Student, Instructor, Admin)
- Course management
- Assignment submission and grading
- Attendance tracking
- Marks/Grades management
- Material distribution

---

## Frontend Architecture

### 1. **Technology Stack**

```
React 19.2.4          - UI Framework
Vite 8.0.1            - Build tool and dev server
Tailwind CSS 3.4.19   - Utility-first CSS framework
Zustand 5.0.12        - Lightweight state management
React Router 7.14.0   - Client-side routing
Axios 1.14.0          - HTTP client
React Hook Form 7.72.1 - Form validation
Zod 4.3.6             - Schema validation
```

### 2. **Frontend Project Structure**

```
frontend/
├── src/
│   ├── api/                    # API client layer
│   │   ├── authApi.js          # Authentication API calls
│   │   ├── studentApi.js       # Student API calls
│   │   ├── instructorApi.js    # Instructor API calls
│   │   ├── axiosInstance.js    # Axios configuration with interceptors
│   │   └── ...
│   ├── components/             # Reusable React components
│   │   ├── AuthInitSkeleton.jsx   # Loading skeleton while auth initializes
│   │   ├── PDFViewer.jsx          # PDF viewing component
│   │   ├── SubmissionFileViewer.jsx # File viewer for submissions
│   │   └── dashboard/             # Dashboard UI components
│   ├── pages/                  # Page components (full page views)
│   │   ├── LoginPage.jsx
│   │   ├── StudentDashboardPage.jsx
│   │   ├── InstructorDashboardPage.jsx
│   │   └── ...
│   ├── routes/                 # Route guards and configuration
│   │   ├── ProtectedRoute.jsx  # Authentication guard
│   │   └── RoleRoute.jsx       # Role-based access guard
│   ├── store/                  # Zustand state management
│   │   └── authStore.js        # Authentication state store
│   ├── layouts/                # Layout components
│   │   └── AppShell.jsx        # Main app shell layout
│   ├── App.jsx                 # Root app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

### 3. **How Frontend Works**

#### Step 1: Application Initialization
```javascript
// main.jsx - React Application starts here
// 1. React DOM renders App.jsx into root element
// 2. App.jsx initializes auth store
// 3. AuthInitSkeleton shown while auth initialization happens
// 4. Once auth is ready, routes are rendered
```

#### Step 2: Authentication Flow
```javascript
// Frontend -> Backend
1. User enters email/password on LoginPage.jsx
2. Form validated using React Hook Form + Zod
3. loginRequest() called from authApi.js
4. Axios POST to http://localhost:8081/api/v1/auth/login
5. Backend validates credentials and returns JWT token
6. Token stored in localStorage
7. Zustand store updated with user data
8. User redirected to dashboard
```

#### Step 3: API Communication Pattern
```javascript
// axiosInstance.js - Interceptor Pattern
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// REQUEST INTERCEPTOR: Adds JWT token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusphere_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// RESPONSE INTERCEPTOR: Handles auth failures
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('edusphere_access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### Step 4: State Management with Zustand
```javascript
// store/authStore.js - Global state management
const useAuthStore = create((set) => ({
  // STATE
  user: null,                  // Current logged-in user
  token: localStorage.getItem('TOKEN_KEY'),
  isAuthenticated: false,
  isInitializing: true,

  // ACTIONS
  initializeAuth: async () => {  // Run on app startup
    // Check if token exists in localStorage
    // Verify token is still valid by calling /api/v1/auth/me
    // If valid, fetch current user and update state
    // If invalid, clear state and redirect to login
  },

  login: async (payload) => {     // Called on login
    // Make login request
    // Extract access token from response
    // Store in localStorage
    // Fetch and store current user data
  },

  logout: () => {                 // Called on logout
    // Remove token from localStorage
    // Clear state
  }
}))
```

#### Step 5: Protected Routes
```javascript
// routes/ProtectedRoute.jsx - Authentication Guard
// Checks if user is authenticated
// If not, redirects to /login

// routes/RoleRoute.jsx - Role-Based Guard
// Checks if user has required role (STUDENT/INSTRUCTOR/ADMIN)
// If not, shows access denied page
```

#### Step 6: Data Display Flow
```javascript
// Example: Student viewing their courses
1. StudentCoursesPage.jsx rendered
2. useEffect() hook calls studentService.getEnrolledCourses()
3. studentApi.js makes GET request to /api/v1/students/me/courses
4. Axios interceptor adds JWT token
5. Backend processes request and returns paged course data
6. Response wrapped in ApiResponse<PagedResponse<>>
7. Frontend receives data and stores in React state
8. Component re-renders with course data
```

---

## Backend Architecture

### 1. **Technology Stack**

```
Java 17              - Programming language
Spring Boot 3.2.12   - Framework
Spring Security      - Authentication & Authorization
Spring Data JPA      - ORM and database access
JWT (JJWT 0.12.3)   - Token-based authentication
MySQL Connector      - Database driver
Lombok               - Reduce boilerplate code
Validation           - Input validation
```

### 2. **Backend Project Structure**

```
src/main/java/com/edusphere/lms/
├── EduSphereLmsApplication.java      # Spring Boot entry point
├── config/
│   ├── SecurityConfig.java           # Security filter chain configuration
│   ├── CorsConfig.java               # CORS configuration
│   └── ...
├── controller/                       # API Endpoints (REST Layer)
│   ├── AuthController.java
│   ├── StudentController.java
│   ├── InstructorController.java
│   ├── MaterialController.java
│   └── ...
├── service/                          # Business Logic Layer
│   ├── AuthService.java
│   ├── StudentService.java
│   ├── InstructorService.java
│   ├── MaterialService.java
│   └── ...
├── repository/                       # Data Access Layer (DAO Pattern)
│   ├── UserRepository.java
│   ├── CourseRepository.java
│   ├── EnrollmentRepository.java
│   ├── AssignmentRepository.java
│   ├── SubmissionRepository.java
│   ├── MarksRepository.java
│   ├── AttendanceRepository.java
│   ├── MaterialRepository.java
│   └── ...
├── entity/                           # Domain Objects (JPA Entities)
│   ├── BaseEntity.java               # Mapped superclass with timestamps
│   ├── User.java
│   ├── Course.java
│   ├── Enrollment.java
│   ├── Assignment.java
│   ├── Submission.java
│   ├── Marks.java
│   ├── Attendance.java
│   ├── Material.java
│   ├── AuditLog.java
│   └── ...
├── dto/                              # Data Transfer Objects
│   ├── request/                      # Incoming request payloads
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── EnrollmentRequest.java
│   │   ├── CreateAssignmentRequest.java
│   │   ├── GradeSubmissionRequest.java
│   │   └── ...
│   └── response/                     # Outgoing response payloads
│       ├── ApiResponse<T>.java       # Wrapper for all API responses
│       ├── LoginResponse.java
│       ├── RegisterResponse.java
│       ├── PagedResponse<T>.java     # Wrapper for paginated responses
│       ├── UserProfileResponse.java
│       ├── StudentCourseResponse.java
│       ├── InstructorCourseResponse.java
│       └── ...
├── security/                         # Security Components
│   ├── JwtProvider.java              # Token generation & validation
│   ├── JwtAuthenticationFilter.java  # JWT filter in security chain
│   ├── CustomUserDetailsService.java # Loads user from database
│   └── ...
├── enums/                            # Enumeration types
│   ├── Role.java                     # STUDENT, INSTRUCTOR, ADMIN
│   ├── UserStatus.java               # ACTIVE, PENDING_VERIFICATION, etc.
│   ├── CourseStatus.java
│   ├── EnrollmentStatus.java
│   └── ...
├── exception/                        # Custom Exception Classes
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   ├── ForbiddenException.java
│   ├── ValidationException.java
│   └── ...
└── util/                             # Utility Classes
    └── ...
```

### 3. **How Backend Works**

#### Step 1: Application Startup
```
1. JVM starts EduSphereLmsApplication.java
2. Spring Boot initializes application context
3. SecurityConfig bean created - defines security filter chain
4. JwtAuthenticationFilter registered
5. All controllers, services, repositories instantiated
6. Database connection established via JPA
7. Server runs on http://localhost:8081
```

#### Step 2: Request Processing Pipeline
```
Request from Frontend
       ↓
HTTP Layer (Servlet)
       ↓
SecurityFilter Chain
  ├─ CORS Filter (CorsConfig)
  ├─ JwtAuthenticationFilter (checks JWT token)
  │   ├─ Extract token from "Authorization: Bearer <token>"
  │   ├─ Validate token signature using JwtProvider
  │   └─ Load User from database using CustomUserDetailsService
  │       └─ Set authentication in Spring Security context
  ├─ Security Authorization Filter (checks @PreAuthorize)
  └─ Servlet Filter
       ↓
DispatcherServlet (Routes to Controller)
       ↓
Controller Method Handler
  ├─ Validate request @Valid annotation
  ├─ Call Service Layer (Business Logic)
  │   ├─ Apply business rules
  │   ├─ Permission checks
  │   ├─ Call Repository Layer (Database Access)
  │   │   ├─ JPA translates Repository methods to SQL queries
  │   │   ├─ Execute on MySQL database
  │   │   └─ Return entity objects
  │   ├─ Transform entities to DTOs
  │   └─ Return result to Controller
  ├─ Wrap response in ApiResponse<T> object
  └─ Return ResponseEntity with HTTP status
       ↓
JSON Response (via Jackson serialization)
       ↓
Response to Frontend
```

#### Step 3: Authentication Flow (Backend)

**POST /api/v1/auth/login**
```java
// AuthController.java
@PostMapping("/login")
public ResponseEntity<ApiResponse<LoginResponse>> login(
    @Valid @RequestBody LoginRequest request
) {
    // Controller delegates to service
    LoginResponse response = authService.login(request);
    
    // Wrap in ApiResponse and return
    return ResponseEntity.ok(
        ApiResponse.success("Login successful", response)
    );
}

// AuthService.java - Business Logic
public LoginResponse login(LoginRequest request) {
    // 1. Normalize email (trim and lowercase)
    String normalizedEmail = normalizeEmail(request.email());
    
    // 2. Repository layer - find user by email (SQL query)
    User user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new UnauthorizedException(
            "Invalid email or password"
        ));
    
    // 3. Password verification (plain text comparison)
    if (!user.getPassword().equals(request.password())) {
        throw new UnauthorizedException("Invalid email or password");
    }
    
    // 4. Check account status
    if (user.getStatus() != UserStatus.ACTIVE) {
        throw new UnauthorizedException("Account is not active");
    }
    
    // 5. Generate JWT token
    String token = jwtProvider.generateToken(
        user.getEmail(),
        user.getRole()
    );
    
    // 6. Return response with token
    return new LoginResponse(
        token,
        "Bearer",
        jwtProvider.getExpiryMs(),
        toUserProfile(user)
    );
}
```

#### Step 4: JWT Token Process

**Token Generation (JwtProvider.java)**
```java
public String generateToken(String email, Role role) {
    Instant now = Instant.now();
    
    return Jwts.builder()
        .subject(email)                    // Who is the token for
        .claim("role", role.name())        // What role does user have
        .issuedAt(Date.from(now))          // When was it created
        .expiration(Date.from(
            now.plusMillis(expiryMs)       // When expires (24 hours)
        ))
        .signWith(signingKey)              // Sign with secret key
        .compact();                        // Create token string
}
```

**Token Validation (JwtAuthenticationFilter.java)**
```
1. Extract token from "Authorization: Bearer <token>" header
2. Call jwtProvider.validateToken(token)
   ├─ Parse token using secret key
   ├─ Verify signature is correct
   ├─ Check if token is expired
   └─ If valid, extract claims (email, role)
3. Load User from database using email from token
4. Create Authentication object with User and role authorities
5. Set in Spring Security context
6. Continue to next filter
```

#### Step 5: Secured Endpoints Example

**GET /api/v1/students/me/courses**
```java
@RestController
@RequestMapping("/api/v1/students/me")
@PreAuthorize("hasRole('STUDENT')")  // Only STUDENT role can access
public class StudentController {

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PagedResponse<StudentCourseResponse>>>
    getEnrolledCourses(
        Authentication authentication,  // Spring provides authenticated user
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "enrolledAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // 1. Get authenticated user email from Spring Security context
        String userEmail = authentication.getName();
        
        // 2. Call service layer
        PagedResponse<StudentCourseResponse> response = 
            studentService.getEnrolledCourses(
                userEmail,
                page,
                size,
                sortBy,
                sortDir
            );
        
        // 3. Return wrapped response
        return ResponseEntity.ok(
            ApiResponse.success("Enrolled courses fetched", response)
        );
    }
}

// StudentService.java
public PagedResponse<StudentCourseResponse> getEnrolledCourses(
    String email,
    int page,
    int size,
    String sortBy,
    String sortDir
) {
    // 1. Find user by email
    User student = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // 2. Create pagination and sorting specification
    Pageable pageable = PageRequest.of(
        page,
        size,
        Sort.Direction.fromString(sortDir),
        sortBy
    );
    
    // 3. Query database for enrolled courses
    // SQL: SELECT * FROM enrollment 
    //      WHERE student_id = ? AND status = 'ACTIVE'
    //      ORDER BY enrolledAt DESC
    //      LIMIT 10 OFFSET 0
    Page<StudentCourseResponse> enrollmentPage = 
        enrollmentRepository.findEnrolledCoursesByStudentId(
            student.getUserId(),
            pageable
        );
    
    // 4. Convert to PagedResponse wrapper
    return new PagedResponse<>(
        enrollmentPage.getContent(),
        enrollmentPage.getNumber(),
        enrollmentPage.getSize(),
        enrollmentPage.getTotalElements(),
        enrollmentPage.getTotalPages(),
        enrollmentPage.isLast()
    );
}
```

#### Step 6: Exception Handling
```java
// When exception occurs in service layer
throw new UnauthorizedException("Invalid credentials");

// Spring catches it globally (if global error handler configured)
// OR controller method returns error response
// Response format:
{
    "success": false,
    "message": "Invalid credentials",
    "data": null,
    "timestamp": "2024-01-15T10:30:00Z",
    "status": 401
}
```

---

## Database Design

### 1. **Database Schema Overview**

The project uses MySQL 8 with the following tables:

#### **USERS Table**
```sql
CREATE TABLE users (
    user_id          VARCHAR(36) PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    role             VARCHAR(50) NOT NULL,      -- STUDENT, INSTRUCTOR, ADMIN
    status           VARCHAR(50) NOT NULL,      -- ACTIVE, PENDING_VERIFICATION
    college_id       VARCHAR(100),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores user account information
**Key Relationships**: One user can be one role only

#### **COURSES Table**
```sql
CREATE TABLE courses (
    course_id       VARCHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50),                -- DRAFT, ACTIVE, ARCHIVED
    instructor_id   VARCHAR(36) FOREIGN KEY,   -- References users
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores course metadata
**Key Relationships**: 
- One instructor can have many courses
- One course can have many students (via enrollment)

#### **ENROLLMENTS Table**
```sql
CREATE TABLE enrollment (
    enrollment_id   VARCHAR(36) PRIMARY KEY,
    student_id      VARCHAR(36) FOREIGN KEY,   -- References users
    course_id       VARCHAR(36) FOREIGN KEY,   -- References courses
    status          VARCHAR(50),                -- ACTIVE, WAITLISTED, DROPPED
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: M-to-M relationship between students and courses
**Key Relationships**: Student → Course (many-to-many)

#### **ASSIGNMENTS Table**
```sql
CREATE TABLE assignment (
    assignment_id   VARCHAR(36) PRIMARY KEY,
    course_id       VARCHAR(36) FOREIGN KEY,   -- References courses
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATETIME,
    instructor_id   VARCHAR(36) FOREIGN KEY,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores assignments for courses
**Key Relationships**: 
- One course has many assignments
- One instructor creates many assignments

#### **SUBMISSIONS Table**
```sql
CREATE TABLE submission (
    submission_id   VARCHAR(36) PRIMARY KEY,
    assignment_id   VARCHAR(36) FOREIGN KEY,   -- References assignment
    student_id      VARCHAR(36) FOREIGN KEY,   -- References users
    content         TEXT,                       -- Submission content or file path
    status          VARCHAR(50),                -- SUBMITTED, GRADED, LATE
    submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores student submissions for assignments
**Key Relationships**: 
- One assignment has many submissions
- One student can have many submissions

#### **MARKS Table**
```sql
CREATE TABLE marks (
    mark_id         VARCHAR(36) PRIMARY KEY,
    student_id      VARCHAR(36) FOREIGN KEY,   -- References users
    course_id       VARCHAR(36) FOREIGN KEY,   -- References courses
    assignment_id   VARCHAR(36) FOREIGN KEY,   -- References assignment (optional)
    score           DOUBLE,
    max_score       DOUBLE DEFAULT 100,
    graded_by       VARCHAR(36) FOREIGN KEY,   -- References users (instructor)
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores marks/grades for students
**Key Relationships**: 
- One student has many marks
- One course has many marks for different students
- Graded by an instructor

#### **ATTENDANCE Table**
```sql
CREATE TABLE attendance (
    attendance_id   VARCHAR(36) PRIMARY KEY,
    student_id      VARCHAR(36) FOREIGN KEY,   -- References users
    course_id       VARCHAR(36) FOREIGN KEY,   -- References courses
    date            DATE NOT NULL,
    status          VARCHAR(50),                -- PRESENT, ABSENT, LEAVE
    marked_by       VARCHAR(36) FOREIGN KEY,   -- References users (instructor)
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Tracks daily attendance records
**Key Relationships**: 
- One student has many attendance records
- One course has many attendance records

#### **MATERIALS Table**
```sql
CREATE TABLE material (
    material_id     VARCHAR(36) PRIMARY KEY,
    course_id       VARCHAR(36) FOREIGN KEY,   -- References courses
    file_name       VARCHAR(255),
    file_path       VARCHAR(500),
    file_type       VARCHAR(50),                -- PDF, DOC, VIDEO, etc.
    file_size       LONG,
    uploader_id     VARCHAR(36) FOREIGN KEY,   -- References users (instructor)
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose**: Stores course materials/resources
**Key Relationships**: 
- One course has many materials
- One instructor uploads materials

#### **AUDIT_LOG Table**
```sql
CREATE TABLE audit_log (
    log_id          VARCHAR(36) PRIMARY KEY,
    action          VARCHAR(255),
    target_entity   VARCHAR(100),               -- User, Course, Assignment, etc.
    target_id       VARCHAR(36),
    performed_by    VARCHAR(36) FOREIGN KEY,   -- References users (admin)
    details         TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Admin logging and audit trail
**Key Relationships**: Track admin actions

### 2. **Database Relationships**

```
┌─────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                    │
└─────────────────────────────────────────────────────────┘

                          USERS
                     ┌─────────────┐
                     │  user_id    │ (PK)
                     │  name       │
                     │  email      │ (UNI)
                     │  password   │
                     │  role       │ (STUDENT, INSTRUCTOR, ADMIN)
                     │  status     │
                     │  college_id │
                     └─────────────┘
                     ▲   ▲   ▲   ▲
        ┌────────────┘   │   │   └─────────────┐
        │                │   │                 │
        │                │   │                 │
    ┌───┴──────┐    ┌────┴───┴────┐    ┌──────┴────┐
    │ COURSES  │    │ ENROLLMENT  │    │ MARKS     │
    │ (1:M)    │    │ (M:M)       │    │ (M:1)     │
    └────┬─────┘    └────┬────────┘    └──────┬────┘
         │                │                   │
    ┌────┴─────────────┐  │               (graded_by)
    │                  │  │
┌───┴────────┐  ┌────┴───┴────┐  ┌───────────────┐
│ASSIGNMENTS │  │  ATTENDANCE │  │   MATERIALS   │
│ (1:M)      │  │  (M:1)      │  │   (1:M)       │
└────┬──────┘  └─────────────┘  └───────────────┘
     │
┌────┴───────────┐
│  SUBMISSIONS   │
│  (1:M)         │
└────────────────┘
```

### 3. **Data Flow Through Tables**

**User Registration → Login → Enroll in Course → Submit Assignment → Get Grades**

```
1. User registers
   → INSERT into users (name, email, password, role='STUDENT', status='ACTIVE')
   → user_id = UUID
   → User now exists in database

2. User logs in
   → SELECT * FROM users WHERE email = ?
   → Validate password
   → Generate JWT token
   → Token contains user_id, email, role

3. Student enrolls in course
   → INSERT into enrollment (student_id, course_id, status='ACTIVE')
   → enrollment_id = UUID
   → Student-Course relationship created

4. Student views their courses
   → SELECT c.* FROM courses c
     JOIN enrollment e ON c.course_id = e.course_id
     WHERE e.student_id = ?
   → Return list of courses student is enrolled in

5. Instructor creates assignment
   → INSERT into assignment (course_id, title, description, due_date, instructor_id)
   → assignment_id = UUID
   → Assignment linked to course

6. Student submits assignment
   → INSERT into submission (assignment_id, student_id, content, status='SUBMITTED', submitted_at=NOW())
   → submission_id = UUID
   → Submission recorded with timestamp

7. Instructor grades submission
   → UPDATE submission SET status='GRADED' WHERE submission_id = ?
   → INSERT into marks (student_id, course_id, assignment_id, score, graded_by)
   → Mark recorded with instructor_id

8. Student views their grades
   → SELECT m.* FROM marks m
     WHERE m.student_id = ? AND m.course_id = ?
   → Return marks for that student in that course
```

---

## API Communication

### 1. **API Endpoint Structure**

All API endpoints follow this pattern:
```
http://localhost:8081/api/v1/{resource}/{action}
```

**Base URL**: `http://localhost:8081/api/v1`

### 2. **API Request/Response Format**

#### Request Format
```
POST /api/v1/auth/login
Content-Type: application/json
Authorization: Bearer <token>  (for authenticated endpoints)

{
  "email": "student@college.edu",
  "password": "hashedPassword123"
}
```

#### Response Format (All Responses)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "userId": "abc-123-def",
      "name": "John Doe",
      "email": "john@college.edu",
      "role": "STUDENT",
      "status": "ACTIVE",
      "collegeId": "STU-2024-001"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 200
}
```

#### Paginated Response Format
```json
{
  "success": true,
  "message": "Courses fetched",
  "data": {
    "content": [
      { "courseId": "course-1", "title": "OOP Concepts", ... },
      { "courseId": "course-2", "title": "DBMS", ... }
    ],
    "currentPage": 0,
    "pageSize": 10,
    "totalElements": 45,
    "totalPages": 5,
    "isLast": false
  },
  "status": 200
}
```

### 3. **Authentication Endpoints**

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "securePassword123",
  "role": "STUDENT",
  "collegeId": "STU-2024-001"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "...",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "STUDENT",
    "status": "ACTIVE",
    "collegeId": "STU-2024-001"
  }
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@college.edu",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": { ... }
  }
}
```

#### Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Current user fetched",
  "data": {
    "userId": "...",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "STUDENT",
    "status": "ACTIVE",
    "collegeId": "STU-2024-001"
  }
}
```

### 4. **Student Endpoints**

#### Get Enrolled Courses
```
GET /api/v1/students/me/courses?page=0&size=10&sortBy=enrolledAt&sortDir=desc
Authorization: Bearer <token>
Role: STUDENT

Response:
{
  "success": true,
  "data": {
    "content": [ { course objects } ],
    "currentPage": 0,
    "pageSize": 10,
    "totalElements": 5,
    "totalPages": 1,
    "isLast": true
  }
}
```

#### Get Assignments
```
GET /api/v1/students/me/assignments?courseId=course-1&page=0&size=10
Authorization: Bearer <token>
Role: STUDENT

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "assignmentId": "assign-1",
        "title": "OOP Assignment",
        "description": "Design pattern implementation",
        "dueDate": "2024-02-15T23:59:59Z",
        "status": "PENDING"
      }
    ]
  }
}
```

#### Get Marks
```
GET /api/v1/students/me/marks?courseId=course-1
Authorization: Bearer <token>
Role: STUDENT

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "markId": "mark-1",
        "score": 95,
        "maxScore": 100,
        "courseId": "course-1",
        "gradedBy": "professor@college.edu"
      }
    ]
  }
}
```

#### Get Attendance
```
GET /api/v1/students/me/attendance?courseId=course-1
Authorization: Bearer <token>
Role: STUDENT

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "attendanceId": "att-1",
        "date": "2024-01-15",
        "status": "PRESENT"
      }
    ]
  }
}
```

### 5. **Instructor Endpoints**

#### Create Assignment
```
POST /api/v1/instructors/me/assignments
Authorization: Bearer <token>
Content-Type: application/json
Role: INSTRUCTOR

Request Body:
{
  "courseId": "course-1",
  "title": "Design Pattern Assignment",
  "description": "Implement 3 design patterns",
  "dueDate": "2024-02-15T23:59:59Z"
}

Response: 201 Created
```

#### Grade Submission
```
POST /api/v1/instructors/me/assignments/assign-1/submissions/submit-1/grade
Authorization: Bearer <token>
Content-Type: application/json
Role: INSTRUCTOR

Request Body:
{
  "score": 95,
  "feedback": "Excellent implementation!"
}

Response: 200 OK
```

#### Mark Attendance
```
POST /api/v1/instructors/me/attendance
Authorization: Bearer <token>
Content-Type: application/json
Role: INSTRUCTOR

Request Body:
{
  "courseId": "course-1",
  "studentId": "student-1",
  "date": "2024-01-15",
  "status": "PRESENT"
}

Response: 201 Created
```

### 6. **HTTP Interceptor Flow (Frontend)**

```javascript
// Every request goes through interceptors

Request Interceptor (outgoing):
1. Get token from localStorage
2. Add Authorization header: "Bearer <token>"
3. Send request to backend

Response Interceptor (incoming):
1. If response status = 401 (Unauthorized)
   → Token expired or invalid
   → Remove token from localStorage
   → Redirect user to /login
2. Otherwise, return response to caller
```

### 7. **Error Handling**

```
HTTP Status Codes:
- 200 OK              : Successful request
- 201 Created         : Resource created successfully
- 400 Bad Request     : Invalid input data
- 401 Unauthorized    : Missing or invalid JWT token
- 403 Forbidden       : User doesn't have permission (wrong role)
- 404 Not Found       : Resource not found
- 500 Server Error    : Server-side error

Error Response Format:
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401
}
```

---

## Spring Boot Components

### 1. **What is Spring Boot?**

Spring Boot is a framework built on top of the Spring Framework that simplifies creating production-ready applications. It provides:

- **Convention over Configuration**: Sensible defaults, less configuration needed
- **Embedded Servers**: No need for external application servers (Tomcat built-in)
- **Starter Dependencies**: Pre-configured dependency sets for common tasks
- **Auto-Configuration**: Automatically configures Spring components based on classpath
- **Actuator**: Built-in monitoring and management endpoints
- **Security**: Integrated Spring Security for authentication/authorization

### 2. **Key Spring Boot Components in This Project**

#### Spring Boot Starter Web
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
**What it does**: 
- Provides REST controller support
- Embeds Tomcat servlet container
- Includes Jackson for JSON serialization
- Provides HTTP request handling

#### Spring Boot Starter Security
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```
**What it does**: 
- Authentication (who are you?)
- Authorization (what can you do?)
- Security filters and interceptors
- Password encoding
- Filter chain configuration

#### Spring Boot Starter Data JPA
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
**What it does**: 
- ORM (Object-Relational Mapping)
- Entity management
- Automatic query generation from method names
- Transaction management

#### Spring Boot Starter Validation
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```
**What it does**: 
- Input validation annotations (@Valid, @NotNull, etc.)
- Automatic validation on controller parameters
- Constraint violation handling

#### Spring Boot Starter Actuator
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```
**What it does**: 
- Monitoring endpoints (/actuator/health, /actuator/metrics)
- Application metrics collection
- Health checks

### 3. **Spring Boot Annotations Used**

#### @SpringBootApplication
```java
@SpringBootApplication
public class EduSphereLmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduSphereLmsApplication.class, args);
    }
}
```
- Main entry point for Spring Boot application
- Combines @Configuration, @EnableAutoConfiguration, @ComponentScan

#### @RestController
```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(...) { }
}
```
- Marks class as REST API controller
- All methods return JSON responses (not HTML)
- REST endpoints are automatically mapped

#### @Service
```java
@Service
public class AuthService {
    // Business logic here
}
```
- Marks class as business logic layer
- Automatically managed bean by Spring
- Usually called by controllers

#### @Repository
```java
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
```
- Marks interface as data access object (DAO)
- Extends JpaRepository for CRUD operations
- Spring auto-implements CRUD methods

#### @Configuration
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
        throws Exception { }
}
```
- Marks class as Spring configuration class
- Can define beans using @Bean methods
- One-time setup for application

#### @Component
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Executed once per request
}
```
- Generic Spring-managed component
- Auto-wired into other beans
- Filters, listeners, utilities

#### @Autowired / Constructor Injection
```java
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    
    // Constructor injection (preferred)
    public AuthService(UserRepository userRepository, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }
}
```
- Dependency injection - Spring provides dependencies
- Constructor injection is best practice
- Avoids circular dependencies

#### @Transactional
```java
@Transactional
public void updateUserStatus(String userId, UserStatus status) {
    // If error occurs, changes rolled back
    // If success, changes committed
}
```
- Manages database transactions
- Auto-rollback on exceptions
- Auto-commit on successful completion

### 4. **Application Configuration (application.yml)**

```yaml
server:
  port: 8081                          # Run on port 8081

spring:
  application:
    name: EduSphere LMS
    
  datasource:
    url: jdbc:mysql://localhost:3306/edusphere_db
    username: root
    password: password
    
  jpa:
    hibernate:
      ddl-auto: validate              # Don't modify schema, validate only
    database-platform: org.hibernate.dialect.MySQL8Dialect
    show-sql: false
    
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

app:
  api-path: /api/v1
  jwt:
    secret: your-256-bit-secret-key-here-needs-to-be-long
    expiry-ms: 86400000              # 24 hours in milliseconds

logging:
  level:
    root: INFO
    com.edusphere: DEBUG
```

### 5. **Spring Boot Lifecycle**

```
1. JVM starts
    ↓
2. SpringApplication.run() called
    ↓
3. ApplicationContext created
    ↓
4. Bean definition scanning
    - Scan for @Configuration classes
    - Scan for @Component, @Service, @Repository
    ↓
5. Auto-configuration
    - Check classpath
    - Apply starter configurations
    ↓
6. Beans instantiated and wired
    - Dependency injection via @Autowired or constructor
    - @Bean methods executed
    ↓
7. ApplicationContext initialized
    ↓
8. Embedded Tomcat started on port 8081
    ↓
9. Application ready to receive requests
    ↓
10. Request comes in:
    a) Tomcat receives HTTP request
    b) DispatcherServlet routes to controller
    c) Controller method invoked
    d) JSON response returned
```

---

## Design Patterns

### 1. **Architectural Patterns**

#### MVC (Model-View-Controller)
```
Frontend (View)  ←→  Backend (Controller) ←→  Database (Model)
React Components    Spring Controllers      JPA Entities
  ↓                    ↓                        ↓
 JSX/HTML         API Endpoints            SQL Tables
```

#### REST (Representational State Transfer)
```
- Resources identified by URIs (/api/v1/students/me/courses)
- Stateless interactions (each request has all info needed)
- HTTP methods for operations (GET, POST, PUT, DELETE)
- Standard response codes (200, 201, 400, 401, 404, 500)
```

#### Client-Server Architecture
```
Frontend (Client)  ←→  HTTP/REST  ←→  Backend (Server)
React Application      JSON            Spring Boot
                       JWT             Database
```

### 2. **Behavioral Patterns**

#### Observer Pattern (Zustand State Management)
```javascript
// Frontend - Observer Pattern
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (payload) => {
    // Change state
    set({ user: userData, isAuthenticated: true })
    // All components observing this store re-render
  }
}))

// Component subscribes to store
function Component() {
  const { user, isAuthenticated } = useAuthStore()  // Observers
  // Re-renders when user or isAuthenticated changes
}
```

#### Strategy Pattern (Different Service Implementations)
```java
// Same interface, different behaviors
public interface AuthService {
    LoginResponse login(LoginRequest request);
}

public interface StudentService {
    PagedResponse<StudentCourseResponse> getEnrolledCourses(...);
}

public interface InstructorService {
    void gradeSubmission(...);
}
```

#### Filter Chain Pattern (JWT Authentication)
```
Request →
  [CORS Filter] →
  [JWT Authentication Filter] →
  [Authorization Filter] →
  [Servlet Filter] →
  [Controller] →
Response
```

#### Interceptor Pattern (Axios Request/Response)
```javascript
// Request interceptor - before request sent
axiosInstance.interceptors.request.use((config) => {
  // Add token
  return config
})

// Response interceptor - after response received
axiosInstance.interceptors.response.use(
  (response) => response,  // Success
  (error) => {             // Failure
    if (401) redirect('/login')
  }
)
```

### 3. **Structural Patterns**

#### Facade Pattern (Service Layer)
```java
// Complex database operations hidden behind simple interface
public class StudentService {
    public PagedResponse<StudentCourseResponse> getEnrolledCourses(String email, ...) {
        // Step 1: Find student
        // Step 2: Query enrollments
        // Step 3: Load courses
        // Step 4: Transform to DTOs
        // Step 5: Create paginated response
        // Complex logic hidden behind one method call
    }
}
```

#### DTO (Data Transfer Object) Pattern
```java
// Separate objects for data transport
// Request DTO
public record LoginRequest(String email, String password) {}

// Response DTO
public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserProfileResponse user
) {}

// Entity (database model)
@Entity
public class User {
    // Database fields
}

// Benefits: Hide internal structure, serialize only needed fields, version control
```

#### Adapter Pattern (Repository)
```java
// Repository adapts JpaRepository to our domain
public interface UserRepository extends JpaRepository<User, String> {
    // JpaRepository provides: save, findById, delete, etc.
    // Custom methods for our business logic
    Optional<User> findByEmail(String email);
}
```

#### Decorator Pattern (Annotations)
```java
@RestController              // Decorator: marks as REST controller
@RequestMapping("/api/v1")  // Decorator: maps base path
@PreAuthorize("hasRole('STUDENT')")  // Decorator: adds authorization
public class StudentController {
    @GetMapping("/courses")  // Decorator: maps GET endpoint
    @Valid                   // Decorator: validates input
    public ResponseEntity<ApiResponse<PagedResponse<StudentCourseResponse>>> 
    getEnrolledCourses(...) {
    }
}
```

### 4. **Creational Patterns**

#### Singleton Pattern (Spring Beans)
```java
@Service
public class AuthService {
    // Spring ensures only one instance of AuthService exists
    // Shared across entire application
}

// Accessed via dependency injection
@Controller
public class AuthController {
    private final AuthService authService;  // Single instance
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
}
```

#### Factory Pattern (JwtProvider)
```java
@Component
public class JwtProvider {
    // Factory for creating JWT tokens
    
    public String generateToken(String email, Role role) {
        // Creates token object
        return Jwts.builder()
            .subject(email)
            .claim("role", role.name())
            .signWith(signingKey)
            .compact();
    }
}
```

#### Builder Pattern (Entity Construction)
```java
// Lombok @Builder generates builder
@Entity
@Builder
public class User {
    private String userId;
    private String name;
    private String email;
    private Role role;
}

// Usage:
User user = User.builder()
    .userId("123")
    .name("John")
    .email("john@email.com")
    .role(Role.STUDENT)
    .build();
```

---

## SOLID Principles

### 1. **Single Responsibility Principle (SRP)**

> Each class should have only one reason to change.

**Good Example:**
```java
// AuthService - only handles authentication logic
@Service
public class AuthService {
    public LoginResponse login(LoginRequest request) { }
    public RegisterResponse register(RegisterRequest request) { }
}

// JwtProvider - only handles JWT token operations
@Component
public class JwtProvider {
    public String generateToken(String email, Role role) { }
    public boolean validateToken(String token) { }
}

// JwtAuthenticationFilter - only handles JWT filter logic
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(...) { }
}
```

**Bad Example (Violates SRP):**
```java
// AuthService doing too many things
@Service
public class AuthService {
    public LoginResponse login(LoginRequest request) {
        // Handle login
        // Generate JWT token
        // Send email
        // Log to audit
        // Cache user
    }
}
```

**Why SRP is important:**
- Easy to test (mock specific responsibilities)
- Easy to maintain (changes affect fewer classes)
- Easy to reuse (each class does one thing well)
- Easy to extend (add new features without modifying existing)

---

### 2. **Open/Closed Principle (OCP)**

> Software entities should be open for extension, closed for modification.

**Good Example:**
```java
// Interface - closed for modification
public interface AuthenticationStrategy {
    AuthResponse authenticate(String credentials);
}

// JWT Implementation - can extend without modifying interface
public class JwtAuthenticationStrategy implements AuthenticationStrategy {
    @Override
    public AuthResponse authenticate(String credentials) {
        // JWT authentication logic
    }
}

// OAuth Implementation - can add new strategy without changing existing code
public class OAuthAuthenticationStrategy implements AuthenticationStrategy {
    @Override
    public AuthResponse authenticate(String credentials) {
        // OAuth authentication logic
    }
}
```

**Bad Example (Violates OCP):**
```java
// Tight coupling - must modify this every time adding new auth type
@Service
public class AuthService {
    public LoginResponse authenticate(LoginRequest request) {
        if (request.getAuthType().equals("JWT")) {
            // JWT logic
        } else if (request.getAuthType().equals("OAuth")) {
            // OAuth logic
        } else if (request.getAuthType().equals("SAML")) {
            // SAML logic
        }
        // Must modify this method for every new type!
    }
}
```

**Why OCP is important:**
- New features added without breaking existing code
- Reduced risk of introducing bugs
- Better code organization and modularity

---

### 3. **Liskov Substitution Principle (LSP)**

> Derived classes should be substitutable for their base classes.

**Good Example:**
```java
// Base interface defines contract
public interface UserRepository {
    Optional<User> findById(String id);
    void save(User user);
}

// Multiple implementations can replace each other
public class MySQLUserRepository implements UserRepository {
    @Override
    public Optional<User> findById(String id) { /* MySQL logic */ }
    
    @Override
    public void save(User user) { /* MySQL logic */ }
}

public class MongoDBUserRepository implements UserRepository {
    @Override
    public Optional<User> findById(String id) { /* MongoDB logic */ }
    
    @Override
    public void save(User user) { /* MongoDB logic */ }
}

// Usage - can swap implementations
@Service
public class AuthService {
    private final UserRepository userRepository;  // Works with both!
    
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**Bad Example (Violates LSP):**
```java
// Derived class breaks contract
public class User {
    public void validateEmail(String email) { }
}

public class AdminUser extends User {
    @Override
    public void validateEmail(String email) {
        // Doesn't validate emails! Contract violated
        return;
    }
}
```

**Why LSP is important:**
- Polymorphism works correctly
- Can swap implementations without breaking code
- Easier testing with mock implementations

---

### 4. **Interface Segregation Principle (ISP)**

> Clients should not depend on interfaces they don't use.

**Good Example:**
```java
// Segregated interfaces - each class implements only what it needs
public interface StudentOperations {
    PagedResponse<StudentCourseResponse> getEnrolledCourses(String studentId);
    PagedResponse<StudentMarksResponse> getMarks(String studentId);
}

public interface InstructorOperations {
    void gradeSubmission(String submissionId, double marks);
    void markAttendance(String courseId, String studentId, String status);
}

public class StudentService implements StudentOperations {
    @Override
    public PagedResponse<StudentCourseResponse> getEnrolledCourses(String studentId) { }
}

public class InstructorService implements InstructorOperations {
    @Override
    public void gradeSubmission(String submissionId, double marks) { }
}
```

**Bad Example (Violates ISP):**
```java
// Fat interface - forces implementation of unused methods
public interface UserService {
    // Student operations
    PagedResponse<StudentCourseResponse> getEnrolledCourses(String studentId);
    
    // Instructor operations
    void gradeSubmission(String submissionId, double marks);
    
    // Admin operations
    void deleteUser(String userId);
}

// Student service forced to implement all
public class StudentService implements UserService {
    @Override
    public void gradeSubmission(...) {
        throw new UnsupportedOperationException();  // Not needed!
    }
}
```

**Why ISP is important:**
- Focused, minimal interfaces
- Classes implement only what they need
- Easier to create mock objects for testing
- Clearer code intent

---

### 5. **Dependency Inversion Principle (DIP)**

> High-level modules should depend on abstractions, not low-level modules.

**Good Example:**
```java
// Depend on abstractions
@Service
public class AuthService {
    private final UserRepository userRepository;      // Abstraction (interface)
    private final JwtProvider jwtProvider;            // Abstraction (interface)
    private final PasswordEncoder passwordEncoder;    // Abstraction (interface)
    
    // Constructor injection of abstractions
    public AuthService(
        UserRepository userRepository,
        JwtProvider jwtProvider,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
    }
}

// Can swap implementations without changing AuthService
// MySQLUserRepository, MongoDBUserRepository, etc.
```

**Bad Example (Violates DIP):**
```java
// Depends directly on low-level concrete classes
@Service
public class AuthService {
    private MySQLUserRepository userRepository;      // Concrete class!
    private JwtProviderImpl jwtProvider;              // Concrete class!
    
    public AuthService() {
        this.userRepository = new MySQLUserRepository();  // Direct instantiation!
        this.jwtProvider = new JwtProviderImpl();          // Tight coupling!
    }
}
// If we want to use MongoDB, must change AuthService!
```

**Why DIP is important:**
- Loose coupling - easy to swap implementations
- Testable - can inject mock objects
- Flexible - new implementations without modifying existing code
- Follows IoC (Inversion of Control) principle

---

## GRASP Patterns

GRASP (General Responsibility Assignment Software Patterns) help assign responsibilities to classes.

### 1. **Creator Pattern**

> Assign creation responsibility to the class that:
> - Uses the created object most often
> - Has necessary data to create it
> - Is logically responsible

**Example:**
```java
// JwtProvider is responsible for creating JWT tokens
@Component
public class JwtProvider {
    public String generateToken(String email, Role role) {
        return Jwts.builder()
            .subject(email)
            .claim("role", role.name())
            .signWith(signingKey)
            .compact();
    }
}

// AuthService uses JwtProvider to create tokens
@Service
public class AuthService {
    private final JwtProvider jwtProvider;
    
    public LoginResponse login(LoginRequest request) {
        // JwtProvider creates token
        String token = jwtProvider.generateToken(
            user.getEmail(),
            user.getRole()
        );
        return new LoginResponse(token, ...);
    }
}
```

### 2. **Information Expert Pattern**

> Assign responsibility to the class with most information about it.

**Example:**
```java
// StudentService has most info about student operations
@Service
public class StudentService {
    // Expert in student enrollments
    public PagedResponse<StudentCourseResponse> getEnrolledCourses(
        String email, int page, int size, ...
    ) {
        User student = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // StudentService knows how to fetch student's courses
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(sortDir), sortBy);
        Page<StudentCourseResponse> enrollmentPage = 
            enrollmentRepository.findEnrolledCoursesByStudentId(
                student.getUserId(),
                pageable
            );
        
        return new PagedResponse<>(...);
    }
}

// InstructorService expert in instructor operations
@Service
public class InstructorService {
    // Expert in grading submissions
    public void gradeSubmission(String submissionId, double marks, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        submission.setStatus(SubmissionStatus.GRADED);
        submission.setMarks(marks);
        submission.setFeedback(feedback);
        
        submissionRepository.save(submission);
    }
}
```

### 3. **Controller Pattern**

> Assign responsibility for receiving and routing user input to a controller class.

**Example:**
```java
// AuthController receives and routes auth requests
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request
    ) {
        // Receives input, delegates to service, returns response
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(
            ApiResponse.success("Login successful", response)
        );
    }
}

// StudentController routes student requests
@RestController
@RequestMapping("/api/v1/students/me")
public class StudentController {
    private final StudentService studentService;
    
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PagedResponse<StudentCourseResponse>>>
    getEnrolledCourses(Authentication authentication, ...) {
        PagedResponse<StudentCourseResponse> response = 
            studentService.getEnrolledCourses(
                authentication.getName(), page, size, sortBy, sortDir
            );
        return ResponseEntity.ok(ApiResponse.success("Courses fetched", response));
    }
}
```

### 4. **Low Coupling Pattern**

> Keep classes independent, minimize dependencies.

**Example:**
```java
// Good: UserRepository is abstraction (low coupling)
@Service
public class AuthService {
    private final UserRepository userRepository;  // Depends on interface
    
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// Can change database implementation without changing AuthService
// Spring can inject MySQLUserRepository or any implementation
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
```

### 5. **High Cohesion Pattern**

> Keep related functionality together in one class.

**Example:**
```java
// Good: Related JWT operations together
@Component
public class JwtProvider {
    // All JWT-related functionality in one place
    
    public String generateToken(String email, Role role) { }
    public String extractUsername(String token) { }
    public boolean validateToken(String token) { }
    public long getExpiryMs() { }
    private Claims extractAllClaims(String token) { }
}

// Good: Related authentication operations together
@Service
public class AuthService {
    // All authentication-related functionality
    
    public RegisterResponse register(RegisterRequest request) { }
    public LoginResponse login(LoginRequest request) { }
    public UserProfileResponse getCurrentUser(String email) { }
}
```

---

## Important Considerations

### 1. **Security Best Practices**

#### Current Implementation (⚠️ IMPORTANT SECURITY ISSUES)
```java
// ❌ SECURITY ISSUE: Plain text passwords!
public LoginResponse login(LoginRequest request) {
    if (!user.getPassword().equals(request.password())) {
        throw new UnauthorizedException("Invalid credentials");
    }
}
```

**Production Fix Needed:**
```java
// ✅ CORRECT: Use BCrypt hashing
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Service
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        
        // Compare hashed passwords, not plain text!
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        
        // Also hash password during registration
        user.setPassword(passwordEncoder.encode(request.password()));
    }
}
```

#### JWT Secret Management
```yaml
# ❌ DON'T: Hardcode secret in code or yaml
app:
  jwt:
    secret: my-weak-secret

# ✅ CORRECT: Use environment variables
app:
  jwt:
    secret: ${JWT_SECRET}  # Read from environment
```

#### CORS Configuration
```java
// Control which origins can access API
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",  // Frontend dev
            "https://yourdomain.com"  // Production
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. **Error Handling Patterns**

#### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
        ResourceNotFoundException ex
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Resource not found", ex.getMessage()));
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(
        UnauthorizedException ex
    ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("Unauthorized", ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
        ValidationException ex
    ) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", ex.getMessage()));
    }
}
```

### 3. **Logging Patterns**

```java
@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    public LoginResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.email());
        
        try {
            User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
            
            logger.info("User found: {}", user.getUserId());
            
            if (!user.getPassword().equals(request.password())) {
                logger.warn("Invalid password for user: {}", user.getUserId());
                throw new UnauthorizedException("Invalid credentials");
            }
            
            String token = jwtProvider.generateToken(user.getEmail(), user.getRole());
            logger.info("JWT token generated for user: {}", user.getUserId());
            
            return new LoginResponse(token, ...);
        } catch (Exception ex) {
            logger.error("Login failed", ex);
            throw ex;
        }
    }
}
```

### 4. **Testing Strategy**

#### Unit Tests
```java
@RunWith(MockitoRunner.class)
public class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private JwtProvider jwtProvider;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    public void testLoginSuccess() {
        // Arrange
        LoginRequest request = new LoginRequest("john@email.com", "password");
        User user = new User();
        user.setEmail("john@email.com");
        user.setPassword("password");
        user.setRole(Role.STUDENT);
        
        when(userRepository.findByEmail("john@email.com"))
            .thenReturn(Optional.of(user));
        
        when(jwtProvider.generateToken("john@email.com", Role.STUDENT))
            .thenReturn("valid-token");
        
        // Act
        LoginResponse response = authService.login(request);
        
        // Assert
        assertEquals("valid-token", response.accessToken());
    }
}
```

#### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testLoginEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"john@email.com\",\"password\":\"password\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
```

### 5. **Performance Optimization**

#### Pagination
```java
// Without pagination - loads 100,000 records (bad!)
List<Course> courses = courseRepository.findAll();

// With pagination - loads 10 records (good!)
Pageable pageable = PageRequest.of(0, 10);
Page<Course> coursesPage = courseRepository.findAll(pageable);
```

#### Lazy Loading vs Eager Loading
```java
@Entity
public class Course {
    @OneToMany(fetch = FetchType.LAZY)  // Load on demand
    private List<Assignment> assignments;
    
    @ManyToOne(fetch = FetchType.EAGER)  // Load immediately
    private User instructor;
}
```

#### Database Indexing
```sql
-- Index frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_enrollment_student ON enrollment(student_id);
CREATE INDEX idx_submission_assignment ON submission(assignment_id);
```

### 6. **Transaction Management**

```java
@Service
public class InstructorService {
    @Transactional  // All or nothing
    public void gradeSubmission(String submissionId, double marks) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        // Step 1: Update submission
        submission.setStatus(SubmissionStatus.GRADED);
        submission.setMarks(marks);
        submissionRepository.save(submission);  // If error here...
        
        // Step 2: Create marks record
        Marks markRecord = new Marks();
        markRecord.setScore(marks);
        markRecord.setSubmissionId(submissionId);
        marksRepository.save(markRecord);  // ...this won't happen
        
        // If any step fails, entire transaction rolled back
    }
}
```

### 7. **API Versioning**

```
Current: /api/v1/...
Future:  /api/v2/...

This allows:
- Breaking changes in v2
- v1 continues working for existing clients
- Gradual migration from v1 to v2
```

---

## Quick Reference Summary

| Component | Purpose | Example |
|-----------|---------|---------|
| **Controller** | Receive HTTP requests | `@PostMapping("/login")` |
| **Service** | Business logic | `authService.login()` |
| **Repository** | Database access | `userRepository.findByEmail()` |
| **Entity** | Database table mapping | `@Entity public class User {}` |
| **DTO** | Data transfer object | `LoginRequest`, `LoginResponse` |
| **Filter** | Intercept requests | `JwtAuthenticationFilter` |
| **Annotation** | Metadata for Spring | `@PreAuthorize`, `@Transactional` |
| **JWT** | Token-based authentication | Bearer token in Authorization header |
| **Pageable** | Pagination support | `PageRequest.of(0, 10)` |
| **Zustand** | Frontend state management | `useAuthStore()` |

---

## Key Takeaways

1. **Frontend** handles UI, user interactions, and displays data using React
2. **Backend** handles business logic, authentication, and database operations using Spring Boot
3. **JWT** provides stateless authentication - token contains all necessary info
4. **Database** stores all persistent data with proper relationships and constraints
5. **API** communicates via REST endpoints with JSON payloads
6. **Design Patterns** make code maintainable, testable, and scalable
7. **SOLID & GRASP** principles ensure clean, professional architecture
8. **Security** is critical - use proper password hashing and token validation
9. **Transactions** ensure data consistency across multiple operations
10. **Pagination** improves performance for large datasets

---

End of Complete Project Documentation
