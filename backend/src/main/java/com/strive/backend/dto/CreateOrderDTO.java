package com.strive.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderDTO {
    private Long userId;
    private Long addressId; // Optional: for backward compatibility or if we implement copying from user addresses
    private OrderAddressDTO orderAddress; // New field for direct order address information
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String cardLastFour;
    private String cardExpiry;
    private List<OrderItemDTO> items;
} 