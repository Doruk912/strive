package com.strive.backend.repository;

import com.strive.backend.model.PromotionalBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionalBannerRepository extends JpaRepository<PromotionalBanner, Integer> {
    
    List<PromotionalBanner> findAllByOrderByDisplayOrderAsc();
    
    List<PromotionalBanner> findByActiveIsTrueOrderByDisplayOrderAsc();
    
    PromotionalBanner findByDisplayOrder(Integer displayOrder);
    
    List<PromotionalBanner> findByDisplayOrderGreaterThan(Integer displayOrder);
} 