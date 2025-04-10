package com.strive.backend.service;

import com.strive.backend.dto.ReviewDTO;
import com.strive.backend.model.Review;
import com.strive.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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