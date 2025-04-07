package com.strive.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private String token;
}