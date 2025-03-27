package com.strive.backend.service;

import com.strive.backend.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(Integer id);

    User getUserByEmail(String email);

    User createUser(User user);

    User updateUser(Integer id, User user);
}
