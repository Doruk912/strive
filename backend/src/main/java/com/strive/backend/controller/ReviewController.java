package com.strive.backend.controller;

import com.strive.backend.dto.ReviewDTO;
import com.strive.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Double> getProductAverageRating(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getAverageRating(productId));
    }
    
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.createReview(reviewDTO));
    }
    
    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<?> getUserProductReview(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {
        Optional<ReviewDTO> review = reviewService.getUserProductReview(userId, productId);
        return review.isPresent() 
                ? ResponseEntity.ok(review.get()) 
                : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/user/{userId}/product/{productId}/exists")
    public ResponseEntity<Boolean> hasUserReviewedProduct(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.hasUserReviewedProduct(userId, productId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable Integer userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }
} 