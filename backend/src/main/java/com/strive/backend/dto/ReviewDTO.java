package com.strive.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Integer id;
    private Integer productId;
    private Integer userId;
    private String userName;  // This will be populated from the user's first and last name
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
} 