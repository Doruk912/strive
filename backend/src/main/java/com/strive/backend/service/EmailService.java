package com.strive.backend.service;

public interface EmailService {
    void sendWelcomeEmail(String to, String firstName);
    void sendEmail(String to, String subject, String text);
} 