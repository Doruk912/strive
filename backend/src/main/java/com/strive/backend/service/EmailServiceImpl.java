package com.strive.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to Strive!";
        String text = "Hello " + firstName + ",\n\n"
                + "Welcome to Strive! We're excited to have you on board.\n\n"
                + "With your new account, you can browse our products, make purchases, and track your orders.\n\n"
                + "If you have any questions or need assistance, please don't hesitate to contact our customer support team.\n\n"
                + "Thank you for choosing Strive!\n\n"
                + "Best regards,\n"
                + "The Strive Team";
        
        sendEmail(to, subject, text);
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
        String subject = "Strive - Password Reset Request";
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
        
        String text = "Hello " + firstName + ",\n\n"
                + "We received a request to reset your password for your Strive account.\n\n"
                + "To reset your password, please click on the link below or copy and paste it into your browser:\n\n"
                + resetUrl + "\n\n"
                + "This link will expire in 30 minutes for security reasons.\n\n"
                + "If you did not request a password reset, please ignore this email or contact our support team.\n\n"
                + "Thank you,\n"
                + "The Strive Team";
        
        sendEmail(to, subject, text);
    }

    @Override
    public void sendEmail(String to, String subject, String text) {
        try {
            log.info("Sending email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("strive.onlineshop@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw e;
        }
    }
} 