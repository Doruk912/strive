package com.strive.backend.controller;

import com.strive.backend.dto.ReviewDTO;
import com.strive.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
} 