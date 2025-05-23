package com.strive.backend.repository;

import com.strive.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProductId(Integer productId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = ?1")
    Double getAverageRatingByProductId(Integer productId);
    
    Optional<Review> findByUserIdAndProductId(Integer userId, Integer productId);
    
    List<Review> findByUserId(Integer userId);
} 