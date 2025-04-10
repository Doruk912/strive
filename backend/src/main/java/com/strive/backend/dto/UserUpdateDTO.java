package com.strive.backend.dto;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String role;
    private String email;
}