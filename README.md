# EduSphere LMS - Learning Management System

A full-stack Learning Management System built with **Spring Boot** (backend) and **React** (frontend). Supports role-based access for Students and Instructors with features for course management, assignments, grading, attendance tracking, and material sharing.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Features](#features)
- [Configuration](#configuration)

---

## 🎯 Project Overview

**EduSphere LMS** is a comprehensive learning management system designed to streamline education delivery with:

- **Students**: Enroll in courses, view assignments, submit work, track grades, check attendance, access course materials
- **Instructors**: Create & manage courses, create assignments, grade submissions, track attendance, upload materials
- **Role-Based Access Control**: Secure authentication using JWT tokens
- **Real-time Updates**: Dynamic dashboard with course summaries and analytics

**Java Version**: 17  
**Spring Boot Version**: 3.2.12  
**Database**: MySQL 8+

---

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.12
- **Language**: Java 17
- **Security**: Spring Security + JWT Authentication
- **Database ORM**: Spring Data JPA / Hibernate
- **Validation**: Jakarta Validation
- **Build Tool**: Maven
- **Key Dependencies**:
  - `spring-boot-starter-web` (REST API)
  - `spring-boot-starter-security` (Authentication/Authorization)
  - `spring-boot-starter-data-jpa` (Database)
  - `mysql-connector-java` (MySQL driver)
  - `jjwt` (JWT token handling)
  - `lombok` (Code generation)

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS + PostCSS
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router DOM 7.14
- **Package Manager**: npm

### Database
- **Type**: MySQL 8+
- **Connection**: JDBC via MySQL Connector/J

---

## 📦 Prerequisites

Before running this project, ensure you have installed:

### Backend Requirements
- **Java JDK 17** or higher
- **Maven 3.8.1** or higher
- **MySQL 8.0** or higher

### Frontend Requirements
- **Node.js 16+** and **npm 8+**

### Verification Commands
```bash
# Check Java
java -version

# Check Maven
mvn -version

# Check Node.js and npm
node -v
npm -v

# Check MySQL
mysql --version
```

---

## 💻 Installation & Setup

### Backend Setup

#### 1. **Create MySQL Database**

```sql
CREATE DATABASE edusphere_lms;
```

#### 2. **Install Backend Dependencies**

```bash
cd d:\Ooad Project
mvn clean install
```

This downloads all Maven dependencies defined in `pom.xml`.

#### 3. **Configure Database Connection**

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/edusphere_lms?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    # Change to your MySQL password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update      # Auto-creates tables on startup
    show-sql: false         # Set to true for SQL debugging
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

app:
  jwt:
    secret: edusphere-super-secret-key-must-be-32-chars-long  # Change in production
    expiry-ms: 86400000    # Token expiry (24 hours in ms)

server:
  port: 8081                # Backend runs on port 8081
```

**⚠️ FOR PRODUCTION:**
- Use strong JWT secrets (at least 32 characters)
- Store credentials in environment variables, not in application.yml
- Use encrypted passwords in MySQL configuration

### Frontend Setup

#### 1. **Install Frontend Dependencies**

```bash
cd d:\Ooad Project\frontend
npm install
```

#### 2. **Configure API Base URL** (if needed)

Check `frontend/src/api/axiosInstance.js` for the backend API URL:

```javascript
const API_BASE_URL = 'http://localhost:8081/api/v1';
```

---

## 🚀 Running the Application

### Start Backend

```bash
cd d:\Ooad Project
mvn spring-boot:run
```

Expected output:
```
Started EduSphereLmsApplication in X.XXX seconds (process running for Y.YYY s)
```

Backend will be available at: `http://localhost:8081`

### Start Frontend

In a **new terminal**, run:

```bash
cd d:\Ooad Project\frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173` (Vite default)

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081/api/v1
- **Swagger API Docs** (if enabled): http://localhost:8081/swagger-ui.html

---

## 📁 Project Structure

```
Ooad Project/
├── src/main/java/com/edusphere/lms/
│   ├── EduSphereLmsApplication.java      # Spring Boot entry point
│   ├── config/
│   │   ├── SecurityConfig.java           # JWT & Spring Security setup
│   │   └── DataInitializer.java          # Seed initial data
│   ├── controller/                       # REST API endpoints
│   │   ├── AuthController.java
│   │   ├── StudentController.java
│   │   ├── InstructorController.java
│   │   └── MaterialController.java
│   ├── service/                          # Business logic layer
│   │   ├── AuthService.java
│   │   ├── StudentService.java
│   │   ├── InstructorService.java
│   │   └── ...
│   ├── repository/                       # Database access layer (JPA)
│   ├── entity/                           # JPA entities (database models)
│   ├── dto/request/ & dto/response/      # Data transfer objects
│   ├── security/                         # JWT & authentication logic
│   ├── exception/                        # Custom exceptions
│   ├── enums/                            # Role, Status enums
│   └── util/                             # Utility classes
├── src/main/resources/
│   ├── application.yml                   # Application configuration
│   └── db/migration/                     # Flyway migrations (if used)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                      # React entry point
│   │   ├── App.jsx                       # Main component
│   │   ├── api/                          # API call functions
│   │   │   ├── axiosInstance.js          # Configured Axios client
│   │   │   ├── authApi.js
│   │   │   ├── studentApi.js
│   │   │   └── instructorApi.js
│   │   ├── components/                   # Reusable components
│   │   ├── pages/                        # Full-page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── InstructorDashboard.jsx
│   │   ├── routes/                       # Route protection
│   │   │   ├── ProtectedRoute.jsx        # Auth check
│   │   │   └── RoleRoute.jsx             # Role-based routing
│   │   ├── store/                        # Zustand state management
│   │   │   └── authStore.js
│   │   ├── App.css & index.css            # Tailwind styles
│   │   └── ...
│   ├── package.json                      # Frontend dependencies
│   ├── vite.config.js                    # Vite configuration
│   ├── tailwind.config.js                # Tailwind CSS config
│   └── .gitignore
│
├── pom.xml                               # Maven configuration
├── .gitignore                            # Git ignore rules
├── README.md                             # This file
├── SYSTEM_OVERVIEW.md                    # Architecture details
├── PROJECT_STRUCTURE.md                  # Project organization
└── uploads/                              # User-uploaded files (materials, etc.)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register        Register new user
POST   /api/v1/auth/login           Login & get JWT token
GET    /api/v1/auth/me              Get current user details
```

### Students
```
GET    /api/v1/students/me/courses           List enrolled courses
GET    /api/v1/students/me/courses/{id}      Get course details
POST   /api/v1/students/me/courses/enroll    Enroll in course
GET    /api/v1/students/me/assignments       List assignments
GET    /api/v1/students/me/submissions       List submissions
POST   /api/v1/students/me/submissions       Submit assignment
GET    /api/v1/students/me/marks             View grades
GET    /api/v1/students/me/attendance        View attendance
GET    /api/v1/students/me/materials         View course materials
```

### Instructors
```
GET    /api/v1/instructors/me/courses         List created courses
POST   /api/v1/instructors/me/courses         Create course
PUT    /api/v1/instructors/me/courses/{id}    Update course
GET    /api/v1/instructors/me/courses/{id}/students  List enrolled students
POST   /api/v1/instructors/me/assignments     Create assignment
GET    /api/v1/instructors/me/submissions     List submissions
POST   /api/v1/instructors/me/submissions/{id}/grade  Grade submission
POST   /api/v1/instructors/me/attendance      Mark attendance
POST   /api/v1/instructors/me/materials       Upload material
```

### Materials
```
GET    /api/v1/materials/{id}       Download material
DELETE /api/v1/materials/{id}       Delete material
```

---

## 🗄 Database Schema

Key entities created automatically by Hibernate:

- **users**: Authentication & user profiles
- **courses**: Course information
- **enrollments**: Student-Course mappings
- **assignments**: Course assignments
- **submissions**: Student assignment submissions
- **marks**: Grades and scores
- **attendance**: Attendance records
- **materials**: Course materials & files
- **audit_logs**: System audit trail

---

## ✨ Features

### Student Features
- ✅ User registration & login with JWT
- ✅ Browse & enroll in courses
- ✅ View course materials
- ✅ Submit assignments
- ✅ View submission status & feedback
- ✅ Check grades/marks
- ✅ Track attendance

### Instructor Features
- ✅ Create & manage courses
- ✅ Create assignments
- ✅ Grade student submissions
- ✅ Upload course materials
- ✅ Track attendance
- ✅ View enrolled students
- ✅ Dashboard analytics

### Security
- ✅ JWT authentication
- ✅ Role-based access control (Student/Instructor)
- ✅ Password hashing (BCrypt)
- ✅ Secure Spring Security configuration
- ✅ CORS enabled for frontend-backend communication

---

## ⚙️ Configuration

### Backend Configuration File: `src/main/resources/application.yml`

| Property | Default | Description |
|----------|---------|-------------|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/edusphere_lms` | MySQL connection URL |
| `spring.datasource.username` | `root` | MySQL username |
| `spring.datasource.password` | `jeeva` | MySQL password |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto-create/update tables |
| `spring.jpa.show-sql` | `true` | Log SQL queries |
| `app.jwt.secret` | `edusphere-super-secret...` | JWT signing key |
| `app.jwt.expiry-ms` | `86400000` | Token expiry (ms) = 24 hours |
| `server.port` | `8081` | Backend port |
| `spring.servlet.multipart.max-file-size` | `10MB` | Max file upload size |

### Frontend Configuration: `frontend/src/api/axiosInstance.js`

Update the API base URL if needed:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1';
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8081 is in use
netstat -ano | findstr :8081

# Check MySQL connection
mysql -u root -p -h localhost

# Rebuild project
mvn clean compile
```

### Frontend API calls fail
- Verify backend is running on `http://localhost:8081`
- Check CORS configuration in `SecurityConfig.java`
- Verify JWT token is being sent in requests

### Database connection error
- Ensure MySQL is running: `mysql --version`
- Verify database exists: `CREATE DATABASE edusphere_lms;`
- Check credentials in `application.yml`

---

## 📝 License

This project is part of an OOAD (Object-Oriented Analysis & Design) coursework.

---

## 👨‍💻 Development Notes

- **JWT Token**: Valid for 24 hours. After expiry, user must login again.
- **File Uploads**: Limited to 10MB per file. Store in `uploads/` directory.
- **Database Migrations**: Currently disabled. Hibernate auto-creates/updates schema.
- **CORS**: Configured for `http://localhost:5173` (Vite frontend).

---

**Last Updated**: April 2026  
**Status**: Development Phase
