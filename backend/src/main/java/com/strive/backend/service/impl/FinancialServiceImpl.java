package com.strive.backend.service.impl;

import com.strive.backend.dto.FinancialMetricDTO;
import com.strive.backend.dto.FinancialOverviewDTO;
import com.strive.backend.dto.FinancialTransactionDTO;
import com.strive.backend.model.FinancialMetric;
import com.strive.backend.model.FinancialTransaction;
import com.strive.backend.model.Order;
import com.strive.backend.repository.FinancialMetricRepository;
import com.strive.backend.repository.FinancialTransactionRepository;
import com.strive.backend.repository.OrderRepository;
import com.strive.backend.service.FinancialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialServiceImpl implements FinancialService {

    private final FinancialMetricRepository financialMetricRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final OrderRepository orderRepository;

    @Override
    public FinancialOverviewDTO getFinancialOverview() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate startOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate startOfPreviousWeek = startOfWeek.minusWeeks(1);
        LocalDate endOfPreviousWeek = startOfWeek.minusDays(1);

        // Get current metrics
        BigDecimal totalRevenue = financialMetricRepository.sumRevenueByDateRange(LocalDate.of(2000, 1, 1), today) != null 
            ? financialMetricRepository.sumRevenueByDateRange(LocalDate.of(2000, 1, 1), today) 
            : BigDecimal.ZERO;
            
        BigDecimal monthlyRevenue = financialMetricRepository.sumRevenueByDateRange(startOfMonth, today) != null 
            ? financialMetricRepository.sumRevenueByDateRange(startOfMonth, today) 
            : BigDecimal.ZERO;
            
        BigDecimal weeklyRevenue = financialMetricRepository.sumRevenueByDateRange(startOfWeek, today) != null 
            ? financialMetricRepository.sumRevenueByDateRange(startOfWeek, today) 
            : BigDecimal.ZERO;
            
        BigDecimal dailyRevenue = financialMetricRepository.findByDate(today)
            .map(FinancialMetric::getDailyRevenue)
            .orElse(BigDecimal.ZERO);
            
        Integer totalOrders = financialMetricRepository.sumOrderCountByDateRange(LocalDate.of(2000, 1, 1), today) != null 
            ? financialMetricRepository.sumOrderCountByDateRange(LocalDate.of(2000, 1, 1), today) 
            : 0;
            
        BigDecimal averageOrderValue = totalOrders > 0 
            ? totalRevenue.divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP) 
            : BigDecimal.ZERO;

        // Calculate growth rates
        BigDecimal previousMonthRevenue = financialMetricRepository.sumRevenueByDateRange(startOfPreviousMonth, endOfPreviousMonth) != null 
            ? financialMetricRepository.sumRevenueByDateRange(startOfPreviousMonth, endOfPreviousMonth) 
            : BigDecimal.ZERO;
            
        Integer previousMonthOrders = financialMetricRepository.sumOrderCountByDateRange(startOfPreviousMonth, endOfPreviousMonth) != null 
            ? financialMetricRepository.sumOrderCountByDateRange(startOfPreviousMonth, endOfPreviousMonth) 
            : 0;

        Integer revenueGrowthRate = 0;
        if (previousMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueGrowthRate = monthlyRevenue.subtract(previousMonthRevenue)
                .multiply(new BigDecimal(100))
                .divide(previousMonthRevenue, 0, RoundingMode.HALF_UP)
                .intValue();
        }

        Integer orderGrowthRate = 0;
        Integer currentMonthOrders = financialMetricRepository.sumOrderCountByDateRange(startOfMonth, today) != null 
            ? financialMetricRepository.sumOrderCountByDateRange(startOfMonth, today) 
            : 0;
            
        if (previousMonthOrders > 0) {
            orderGrowthRate = (currentMonthOrders - previousMonthOrders) * 100 / previousMonthOrders;
        }

        // Calculate weekly revenue growth rate
        BigDecimal previousWeekRevenue = financialMetricRepository.sumRevenueByDateRange(startOfPreviousWeek, endOfPreviousWeek) != null 
            ? financialMetricRepository.sumRevenueByDateRange(startOfPreviousWeek, endOfPreviousWeek) 
            : BigDecimal.ZERO;

        Integer weeklyRevenueGrowthRate = 0;
        if (previousWeekRevenue.compareTo(BigDecimal.ZERO) > 0) {
            weeklyRevenueGrowthRate = weeklyRevenue.subtract(previousWeekRevenue)
                .multiply(new BigDecimal(100))
                .divide(previousWeekRevenue, 0, RoundingMode.HALF_UP)
                .intValue();
        }

        // Get recent data
        List<FinancialMetricDTO> recentMetrics = financialMetricRepository.findLatestMetrics(10)
            .stream()
            .map(this::convertToFinancialMetricDTO)
            .collect(Collectors.toList());

        List<FinancialTransactionDTO> recentTransactions = financialTransactionRepository.findLatestTransactions(10)
            .stream()
            .map(this::convertToFinancialTransactionDTO)
            .collect(Collectors.toList());

        return FinancialOverviewDTO.builder()
            .totalRevenue(totalRevenue)
            .monthlyRevenue(monthlyRevenue)
            .weeklyRevenue(weeklyRevenue)
            .dailyRevenue(dailyRevenue)
            .totalOrders(totalOrders)
            .averageOrderValue(averageOrderValue)
            .recentMetrics(recentMetrics)
            .recentTransactions(recentTransactions)
            .revenueGrowthRate(revenueGrowthRate)
            .orderGrowthRate(orderGrowthRate)
            .weeklyRevenueGrowthRate(weeklyRevenueGrowthRate)
            .build();
    }

    @Override
    public List<FinancialMetricDTO> getFinancialMetricsByDateRange(LocalDate startDate, LocalDate endDate) {
        return financialMetricRepository.findByDateBetweenOrderByDateDesc(startDate, endDate)
            .stream()
            .map(this::convertToFinancialMetricDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<FinancialTransactionDTO> getRecentTransactions(int limit) {
        return financialTransactionRepository.findLatestTransactions(limit)
            .stream()
            .map(this::convertToFinancialTransactionDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<FinancialTransactionDTO> getAllTransactions() {
        return financialTransactionRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(FinancialTransaction::getCreatedAt).reversed())
            .map(this::convertToFinancialTransactionDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void recordOrderTransaction(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Record transaction
        FinancialTransaction transaction = FinancialTransaction.builder()
            .order(order)
            .amount(order.getTotalAmount())
            .description("Order #" + order.getId())
            .transactionType(FinancialTransaction.TransactionType.ORDER)
            .createdAt(LocalDateTime.now())
            .build();
        
        financialTransactionRepository.save(transaction);

        // Update daily metrics
        LocalDate orderDate = order.getCreatedAt().toLocalDate();
        Optional<FinancialMetric> existingMetric = financialMetricRepository.findByDate(orderDate);

        if (existingMetric.isPresent()) {
            FinancialMetric metric = existingMetric.get();
            metric.setDailyRevenue(metric.getDailyRevenue().add(order.getTotalAmount()));
            metric.setOrdersCount(metric.getOrdersCount() + 1);
            metric.setUpdatedAt(LocalDateTime.now());
            financialMetricRepository.save(metric);
        } else {
            FinancialMetric newMetric = FinancialMetric.builder()
                .date(orderDate)
                .dailyRevenue(order.getTotalAmount())
                .ordersCount(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            financialMetricRepository.save(newMetric);
        }
    }

    private FinancialMetricDTO convertToFinancialMetricDTO(FinancialMetric financialMetric) {
        return FinancialMetricDTO.builder()
            .id(financialMetric.getId())
            .date(financialMetric.getDate())
            .dailyRevenue(financialMetric.getDailyRevenue())
            .ordersCount(financialMetric.getOrdersCount())
            .averageOrderValue(financialMetric.getAverageOrderValue())
            .build();
    }

    private FinancialTransactionDTO convertToFinancialTransactionDTO(FinancialTransaction financialTransaction) {
        return FinancialTransactionDTO.builder()
            .id(financialTransaction.getId())
            .orderId(financialTransaction.getOrder() != null ? financialTransaction.getOrder().getId() : null)
            .amount(financialTransaction.getAmount())
            .description(financialTransaction.getDescription())
            .transactionType(financialTransaction.getTransactionType())
            .createdAt(financialTransaction.getCreatedAt())
            .build();
    }
} 