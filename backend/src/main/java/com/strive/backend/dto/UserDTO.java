package com.strive.backend.dto;

import com.strive.backend.model.User;
import lombok.Data;

@Data
public class UserDTO {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String countryCode;
    private String role;
    private String token;

    public static UserDTO fromUser(User user, String token) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setCountryCode(user.getCountryCode());
        dto.setRole(user.getRole().name());
        dto.setToken(token);
        return dto;
    }
}
