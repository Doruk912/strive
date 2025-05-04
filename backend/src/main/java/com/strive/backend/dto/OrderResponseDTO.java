package com.strive.backend.dto;

import com.strive.backend.model.OrderStatus;
import com.strive.backend.model.PaymentStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private Long userId;
    private Long addressId;
    private OrderAddressDTO orderAddress;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String cardLastFour;
    private String cardExpiry;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;

    @Data
    public static class OrderItemResponseDTO {
        private Long id;
        private Long productId;
        private Integer quantity;
        private String size;
        private BigDecimal price;
    }
} 