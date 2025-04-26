package com.strive.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    
    @NotBlank(message = "Token ID is required")
    private String tokenId;
    
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
}