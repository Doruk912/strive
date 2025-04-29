package com.strive.backend.dto;

import com.strive.backend.model.FinancialTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialTransactionDTO {
    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String description;
    private FinancialTransaction.TransactionType transactionType;
    private LocalDateTime createdAt;
} 