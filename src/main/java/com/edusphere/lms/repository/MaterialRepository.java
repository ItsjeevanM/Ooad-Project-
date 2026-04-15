package com.edusphere.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edusphere.lms.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, String> {
    List<Material> findByCourseId(String courseId);
    
    List<Material> findByCourseIdOrderByEnrolledAtDesc(String courseId);
}
