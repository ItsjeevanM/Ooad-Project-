package com.edusphere.lms.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.edusphere.lms.dto.response.MaterialResponse;
import com.edusphere.lms.entity.Course;
import com.edusphere.lms.entity.Material;
import com.edusphere.lms.entity.User;
import com.edusphere.lms.enums.Role;
import com.edusphere.lms.enums.UserStatus;
import com.edusphere.lms.exception.ResourceNotFoundException;
import com.edusphere.lms.exception.UnauthorizedException;
import com.edusphere.lms.repository.CourseRepository;
import com.edusphere.lms.repository.MaterialRepository;
import com.edusphere.lms.repository.UserRepository;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final String uploadDir = "uploads/materials";

    public MaterialService(
            MaterialRepository materialRepository,
            CourseRepository courseRepository,
            UserRepository userRepository
    ) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        
        // Create upload directory if it doesn't exist
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public MaterialResponse uploadMaterial(String email, String courseId, MultipartFile file) {
        User instructor = getActiveInstructor(email);
        
        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructor.getUserId())) {
            throw new UnauthorizedException("You can only upload materials to your own courses");
        }
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            String filePath = uploadDir + File.separator + uniqueFilename;
            
            // Save file to disk
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());
            
            // Create Material entity
            Material material = new Material();
            material.setMaterialId(UUID.randomUUID().toString());
            material.setTitle(originalFilename.replaceAll("\\.[^.]*$", ""));
            material.setFileName(uniqueFilename);
            material.setFilePath(filePath);
            material.setFileType(file.getContentType());
            material.setFileSize(file.getSize());
            material.setCourseId(courseId);
            material.setUploadedBy(instructor.getUserId());
            
            // Save to database
            Material saved = materialRepository.save(material);
            
            return new MaterialResponse(
                    saved.getMaterialId(),
                    saved.getTitle(),
                    "/api/v1/files/" + saved.getFileName(),
                    saved.getCourseId(),
                    saved.getUploadedBy(),
                    saved.getEnrolledAt()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    public List<MaterialResponse> getMaterialsByCourse(String courseId) {
        return materialRepository.findByCourseIdOrderByEnrolledAtDesc(courseId)
                .stream()
                .map(material -> new MaterialResponse(
                        material.getMaterialId(),
                        material.getTitle(),
                        "/api/v1/files/" + material.getFileName(),
                        material.getCourseId(),
                        material.getUploadedBy(),
                        material.getEnrolledAt()
                ))
                .toList();
    }

    public byte[] downloadFile(String filename) {
        try {
            String filePath = uploadDir + File.separator + filename;
            Path path = Paths.get(filePath);
            
            // Security check: ensure file is within upload directory
            File uploadDirFile = new File(uploadDir).getCanonicalFile();
            File requestedFile = path.toFile().getCanonicalFile();
            
            if (!requestedFile.getPath().startsWith(uploadDirFile.getPath())) {
                throw new UnauthorizedException("Invalid file path");
            }
            
            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
            
            return Files.readAllBytes(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
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
}
