package com.strive.backend.controller;

import com.strive.backend.model.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<User> getAllUsers() {
        User user1 = new User("john.doe@example.com", "password123", "John", "Doe", "1234567890", User.UserRole.CUSTOMER);
        User user2 = new User("jane.doe@example.com", "password456", "Jane", "Doe", "0987654321", User.UserRole.ADMIN);

        return Arrays.asList(user1, user2);
    }
}
