package com.strive.backend.service;

import com.strive.backend.model.User;
import com.strive.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User createUser(User user) {
        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Integer id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only the fields that are provided
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getPhone() != null) {
            // If phone is just the country code, set it to null
            if (userDetails.getPhone().length() <= 3) {
                user.setPhone(null);
            } else {
                user.setPhone(userDetails.getPhone());
            }
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }

        return userRepository.save(user);
    }
}
