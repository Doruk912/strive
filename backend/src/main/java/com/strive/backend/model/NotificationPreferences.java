package com.strive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notification_preferences")
public class NotificationPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Column(name = "order_updates", nullable = false)
    private Boolean orderUpdates = true;

    @Column(name = "promotions", nullable = false)
    private Boolean promotions = false;

    @Column(name = "newsletter", nullable = false)
    private Boolean newsletter = true;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 