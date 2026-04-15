package com.edusphere.lms.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.edusphere.lms.dto.response.ApiResponse;
import com.edusphere.lms.dto.response.MaterialResponse;
import com.edusphere.lms.service.MaterialService;

@RestController
@RequestMapping("/api/v1")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping("/instructors/materials/upload")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<MaterialResponse>> uploadMaterial(
            Authentication authentication,
            @RequestParam String courseId,
            @RequestParam("file") MultipartFile file
    ) {
        MaterialResponse response = materialService.uploadMaterial(authentication.getName(), courseId, file);
        return ResponseEntity.ok(ApiResponse.success("Material uploaded successfully", response));
    }

    @GetMapping("/students/materials/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getMaterialsByCourse(
            @PathVariable String courseId
    ) {
        List<MaterialResponse> materials = materialService.getMaterialsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Materials fetched", materials));
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        byte[] fileBytes = materialService.downloadFile(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(fileBytes);
    }
}
