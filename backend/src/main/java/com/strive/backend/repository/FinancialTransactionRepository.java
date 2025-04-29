package com.strive.backend.repository;

import com.strive.backend.model.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    
    List<FinancialTransaction> findByOrderId(Long orderId);
    
    List<FinancialTransaction> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    @Query(value = "SELECT * FROM financial_transactions ORDER BY created_at DESC LIMIT ?1", nativeQuery = true)
    List<FinancialTransaction> findLatestTransactions(int limit);
    
    List<FinancialTransaction> findByTransactionType(FinancialTransaction.TransactionType type);
} 