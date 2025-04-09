package com.strive.backend.repository;

import com.strive.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull();
    
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent.id = :parentId")
    List<Category> findByParentId(Long parentId);
} 