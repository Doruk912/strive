package com.strive.backend.service;

import com.strive.backend.dto.CreateOrderDTO;
import com.strive.backend.dto.OrderItemDTO;
import com.strive.backend.dto.OrderResponseDTO;
import com.strive.backend.model.Order;
import com.strive.backend.model.OrderItem;
import com.strive.backend.model.PaymentStatus;
import com.strive.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final FinancialService financialService;

    @Transactional
    public OrderResponseDTO createOrder(CreateOrderDTO createOrderDTO) {
        Order order = new Order();
        order.setUserId(createOrderDTO.getUserId());
        order.setAddressId(createOrderDTO.getAddressId());
        order.setTotalAmount(createOrderDTO.getTotalAmount());
        order.setPaymentMethod(createOrderDTO.getPaymentMethod());
        order.setCardLastFour(createOrderDTO.getCardLastFour());
        order.setCardExpiry(createOrderDTO.getCardExpiry());
        order.setPaymentStatus(PaymentStatus.COMPLETED);

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemDTO itemDTO : createOrderDTO.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemDTO.getProductId());
            item.setQuantity(itemDTO.getQuantity());
            item.setSize(itemDTO.getSize());
            item.setPrice(itemDTO.getPrice());
            orderItems.add(item);
        }
        order.setOrderItems(orderItems);

        order = orderRepository.save(order);
        
        // Record financial transaction for the order
        financialService.recordOrderTransaction(order.getId());
        
        return convertToDTO(order);
    }

    public List<OrderResponseDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    private OrderResponseDTO convertToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setAddressId(order.getAddressId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setCardLastFour(order.getCardLastFour());
        dto.setCardExpiry(order.getCardExpiry());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderResponseDTO.OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    OrderResponseDTO.OrderItemResponseDTO itemDTO = new OrderResponseDTO.OrderItemResponseDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProductId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setSize(item.getSize());
                    itemDTO.setPrice(item.getPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        return dto;
    }
} 