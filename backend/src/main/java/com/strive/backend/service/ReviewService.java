package com.strive.backend.service;

import com.strive.backend.dto.ReviewDTO;
import com.strive.backend.model.Review;
import com.strive.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<ReviewDTO> getReviewsByProductId(Integer productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Double getAverageRating(Integer productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }
    
    public ReviewDTO createReview(ReviewDTO reviewDTO) {
        // Check if user has already reviewed this product
        Optional<Review> existingReview = reviewRepository.findByUserIdAndProductId(
            reviewDTO.getUserId(), reviewDTO.getProductId());
        
        if (existingReview.isPresent()) {
            // Update existing review instead of creating a new one
            Review review = existingReview.get();
            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
            Review savedReview = reviewRepository.save(review);
            return convertToDTO(savedReview);
        }
        
        // Create new review
        Review review = new Review();
        review.setProductId(reviewDTO.getProductId());
        review.setUserId(reviewDTO.getUserId());
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        
        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview);
    }
    
    public Optional<ReviewDTO> getUserProductReview(Integer userId, Integer productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId)
                .map(this::convertToDTO);
    }
    
    public boolean hasUserReviewedProduct(Integer userId, Integer productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }
    
    public List<ReviewDTO> getReviewsByUserId(Integer userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setProductId(review.getProductId());
        dto.setUserId(review.getUserId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        
        // Set user name from the User entity
        if (review.getUser() != null) {
            dto.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        } else {
            dto.setUserName("Anonymous");
        }
        
        return dto;
    }
} 