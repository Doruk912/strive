package com.strive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialOverviewDTO {
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal dailyRevenue;
    private Integer totalOrders;
    private BigDecimal averageOrderValue;
    private List<FinancialMetricDTO> recentMetrics;
    private List<FinancialTransactionDTO> recentTransactions;
    private Integer revenueGrowthRate;
    private Integer orderGrowthRate;
    private Integer weeklyRevenueGrowthRate;
} 