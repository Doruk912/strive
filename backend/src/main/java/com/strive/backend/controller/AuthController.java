package com.strive.backend.controller;

import com.strive.backend.dto.LoginRequest;
import com.strive.backend.dto.LoginResponse;
import com.strive.backend.dto.RegisterRequest;
import com.strive.backend.dto.UserDTO;
import com.strive.backend.model.User;
import com.strive.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);

            // Convert to UserDTO to include all necessary user information
            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(loginResponse.getUserId());
            userDTO.setEmail(loginResponse.getEmail());
            userDTO.setFirstName(loginResponse.getFirstName());
            userDTO.setLastName(loginResponse.getLastName());
            userDTO.setPhone(loginResponse.getPhone());
            userDTO.setRole(loginResponse.getRole());
            userDTO.setToken(loginResponse.getToken());

            return ResponseEntity.ok(userDTO);
        } catch (UsernameNotFoundException | BadCredentialsException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = authService.register(registerRequest);

            // Create a response DTO with basic success information
            UserDTO responseDTO = new UserDTO();
            responseDTO.setUserId(user.getId());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setFirstName(user.getFirstName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setPhone(user.getPhone());
            responseDTO.setRole(user.getRole().name());

            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
}