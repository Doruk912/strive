package com.strive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "daily_revenue", nullable = false)
    private BigDecimal dailyRevenue;

    @Column(name = "orders_count", nullable = false)
    private Integer ordersCount;

    @Column(name = "average_order_value", insertable = false, updatable = false)
    private BigDecimal averageOrderValue;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 