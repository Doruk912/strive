package com.strive.backend.service;

import com.strive.backend.dto.FinancialMetricDTO;
import com.strive.backend.dto.FinancialOverviewDTO;
import com.strive.backend.dto.FinancialTransactionDTO;

import java.time.LocalDate;
import java.util.List;

public interface FinancialService {
    FinancialOverviewDTO getFinancialOverview();
    
    List<FinancialMetricDTO> getFinancialMetricsByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<FinancialTransactionDTO> getRecentTransactions(int limit);
    
    void recordOrderTransaction(Long orderId);
} 