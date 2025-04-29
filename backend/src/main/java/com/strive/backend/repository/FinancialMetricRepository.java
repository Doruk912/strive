package com.strive.backend.repository;

import com.strive.backend.model.FinancialMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialMetricRepository extends JpaRepository<FinancialMetric, Long> {
    
    Optional<FinancialMetric> findByDate(LocalDate date);
    
    List<FinancialMetric> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(fm.dailyRevenue) FROM FinancialMetric fm WHERE fm.date BETWEEN ?1 AND ?2")
    BigDecimal sumRevenueByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(fm.ordersCount) FROM FinancialMetric fm WHERE fm.date BETWEEN ?1 AND ?2")
    Integer sumOrderCountByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT AVG(fm.averageOrderValue) FROM FinancialMetric fm WHERE fm.date BETWEEN ?1 AND ?2")
    BigDecimal avgOrderValueByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query(value = "SELECT * FROM financial_metrics ORDER BY date DESC LIMIT ?1", nativeQuery = true)
    List<FinancialMetric> findLatestMetrics(int limit);
} 