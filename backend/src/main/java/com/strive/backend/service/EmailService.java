package com.strive.backend.service;

public interface EmailService {
    void sendWelcomeEmail(String to, String firstName);
    void sendEmail(String to, String subject, String text);
    void sendPasswordResetEmail(String to, String firstName, String resetToken);
    void sendOrderConfirmationEmail(String to, String firstName, Long orderId, String totalAmount);
    void sendHtmlOrderConfirmationEmail(String to, String firstName, Long orderId, String totalAmount, java.util.List<com.strive.backend.model.OrderItem> orderItems);
    void sendHtmlEmail(String to, String subject, String htmlContent);
} 