package com.strive.backend.service;

import com.strive.backend.dto.LoginRequest;
import com.strive.backend.dto.LoginResponse;
import com.strive.backend.model.User;
import com.strive.backend.security.JwtUtil;
import com.strive.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail());
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + loginRequest.getEmail());
        }
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user);
        
        return new LoginResponse(
            token, 
            user.getId(), 
            user.getEmail(), 
            user.getFirstName(), 
            user.getLastName(),
            user.getRole()
        );
    }
} 