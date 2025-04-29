package com.strive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialMetricDTO {
    private Long id;
    private LocalDate date;
    private BigDecimal dailyRevenue;
    private Integer ordersCount;
    private BigDecimal averageOrderValue;
} 