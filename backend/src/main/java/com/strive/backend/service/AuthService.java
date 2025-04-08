package com.strive.backend.service;

import com.strive.backend.dto.LoginRequest;
import com.strive.backend.dto.LoginResponse;
import com.strive.backend.dto.RegisterRequest;
import com.strive.backend.model.User;
import com.strive.backend.model.NotificationPreferences;
import com.strive.backend.security.JwtUtil;
import com.strive.backend.repository.UserRepository;
import com.strive.backend.repository.NotificationPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationPreferencesRepository notificationPreferencesRepository;
    
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail());
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + loginRequest.getEmail());
        }
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user);
        
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setCountryCode(user.getCountryCode());
        response.setRole(user.getRole().name());
        response.setToken(token);
        
        return response;
    }
    
    @Transactional
    public User register(RegisterRequest registerRequest) {
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()) != null) {
            throw new RuntimeException("Email is already in use");
        }
        
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhone(registerRequest.getPhone());
        // Role is automatically set to CUSTOMER because of the default value in the User entity
        
        User savedUser = userRepository.save(user);

        // Create default notification preferences for the new user
        NotificationPreferences defaultPreferences = new NotificationPreferences();
        defaultPreferences.setUserId(savedUser.getId());
        defaultPreferences.setEmailNotifications(true);
        defaultPreferences.setOrderUpdates(true);
        defaultPreferences.setPromotions(false);
        defaultPreferences.setNewsletter(true);
        
        notificationPreferencesRepository.save(defaultPreferences);
        
        return savedUser;
    }
} 