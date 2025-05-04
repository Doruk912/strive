package com.strive.backend.repository;

import com.strive.backend.model.OrderAddress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderAddressRepository extends JpaRepository<OrderAddress, Integer> {
} 