package com.strive.backend.repository;

import com.strive.backend.model.FeaturedCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeaturedCategoryRepository extends JpaRepository<FeaturedCategory, Long> {
    List<FeaturedCategory> findAllByOrderByDisplayOrderAsc();
    
    @Query("SELECT MAX(fc.displayOrder) FROM FeaturedCategory fc")
    Integer findMaxDisplayOrder();
    
    boolean existsByDisplayOrder(Integer displayOrder);
} 