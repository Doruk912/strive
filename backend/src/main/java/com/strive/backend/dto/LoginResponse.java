package com.strive.backend.dto;

import com.strive.backend.model.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
} 