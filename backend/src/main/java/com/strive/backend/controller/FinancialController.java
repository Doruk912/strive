package com.strive.backend.controller;

import com.strive.backend.dto.FinancialMetricDTO;
import com.strive.backend.dto.FinancialOverviewDTO;
import com.strive.backend.dto.FinancialTransactionDTO;
import com.strive.backend.service.FinancialService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finances")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FinancialController {

    private final FinancialService financialService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<FinancialOverviewDTO> getFinancialOverview() {
        return ResponseEntity.ok(financialService.getFinancialOverview());
    }
    
    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<FinancialMetricDTO>> getFinancialMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(financialService.getFinancialMetricsByDateRange(startDate, endDate));
    }
    
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<FinancialTransactionDTO>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(financialService.getRecentTransactions(limit));
    }
} 