package com.strive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "promotional_banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionalBanner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 50)
    private String title;
    
    @Column(nullable = false, length = 100)
    private String subtitle;
    
    @Column(nullable = false, length = 100)
    private String highlight;
    
    @Column(nullable = false, length = 50)
    private String icon;
    
    @Column(name = "background_color", nullable = false, length = 20)
    private String backgroundColor;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 