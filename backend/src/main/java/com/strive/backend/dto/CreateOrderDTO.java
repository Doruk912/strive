package com.strive.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderDTO {
    private Long userId;
    private Long addressId;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String cardLastFour;
    private String cardExpiry;
    private List<OrderItemDTO> items;
} 