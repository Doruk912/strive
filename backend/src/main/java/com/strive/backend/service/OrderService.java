package com.strive.backend.service;

import com.strive.backend.dto.CreateOrderDTO;
import com.strive.backend.dto.OrderAddressDTO;
import com.strive.backend.dto.OrderItemDTO;
import com.strive.backend.dto.OrderResponseDTO;
import com.strive.backend.model.Address;
import com.strive.backend.model.Order;
import com.strive.backend.model.OrderAddress;
import com.strive.backend.model.OrderItem;
import com.strive.backend.model.OrderStatus;
import com.strive.backend.model.PaymentStatus;
import com.strive.backend.model.User;
import com.strive.backend.repository.OrderAddressRepository;
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
    private final OrderAddressRepository orderAddressRepository;
    private final FinancialService financialService;
    private final AddressService addressService;
    private final EmailService emailService;
    private final UserService userService;

    @Transactional
    public OrderResponseDTO createOrder(CreateOrderDTO createOrderDTO) {
        // First, handle the order address
        OrderAddress orderAddress;
        if (createOrderDTO.getOrderAddress() != null) {
            // New address provided in the order
            orderAddress = OrderAddress.builder()
                    .name(createOrderDTO.getOrderAddress().getName())
                    .recipientName(createOrderDTO.getOrderAddress().getRecipientName())
                    .recipientPhone(createOrderDTO.getOrderAddress().getRecipientPhone())
                    .streetAddress(createOrderDTO.getOrderAddress().getStreetAddress())
                    .city(createOrderDTO.getOrderAddress().getCity())
                    .state(createOrderDTO.getOrderAddress().getState())
                    .postalCode(createOrderDTO.getOrderAddress().getPostalCode())
                    .country(createOrderDTO.getOrderAddress().getCountry())
                    .build();
            orderAddress = orderAddressRepository.save(orderAddress);
        } else if (createOrderDTO.getAddressId() != null) {
            // Copy from user's address to order_addresses
            Address userAddress = addressService.getAddressById(createOrderDTO.getAddressId().intValue());
            
            orderAddress = OrderAddress.builder()
                    .name(userAddress.getName())
                    .recipientName(userAddress.getRecipientName())
                    .recipientPhone(userAddress.getRecipientPhone())
                    .streetAddress(userAddress.getStreetAddress())
                    .city(userAddress.getCity())
                    .state(userAddress.getState())
                    .postalCode(userAddress.getPostalCode())
                    .country(userAddress.getCountry())
                    .build();
            orderAddress = orderAddressRepository.save(orderAddress);
        } else {
            throw new RuntimeException("Order address information is required");
        }

        // Now create the order with the saved address ID
        Order order = new Order();
        order.setUserId(createOrderDTO.getUserId());
        order.setAddressId(orderAddress.getId().longValue()); // Use the newly created address
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
        
        // Send order confirmation email
        try {
            User user = userService.getUserById(order.getUserId().intValue());
            if (user != null && user.getEmail() != null) {
                // Send HTML order confirmation email with product images
                emailService.sendHtmlOrderConfirmationEmail(
                    user.getEmail(),
                    user.getFirstName(),
                    order.getId(),
                    order.getTotalAmount().toString(),
                    order.getOrderItems()
                );
            }
        } catch (Exception e) {
            // Log error but don't stop order processing
            // We don't want a failed email to prevent order completion
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
        
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
    
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Remember the previous status to check if it's changing to DELIVERED
        OrderStatus previousStatus = order.getStatus();
        
        // Update the status
        order.setStatus(status);
        order = orderRepository.save(order);
        
        // If status is changing to DELIVERED, send a delivery notification email
        if (status == OrderStatus.DELIVERED && previousStatus != OrderStatus.DELIVERED) {
            try {
                User user = userService.getUserById(order.getUserId().intValue());
                if (user != null && user.getEmail() != null) {
                    // Send delivery notification with review option
                    emailService.sendOrderDeliveredEmail(
                        user.getEmail(),
                        user.getFirstName(),
                        order.getId(),
                        order.getOrderItems()
                    );
                }
            } catch (Exception e) {
                // Log error but don't stop the process
                System.err.println("Failed to send order delivered email: " + e.getMessage());
            }
        }
        
        return convertToDTO(order);
    }
    
    public OrderAddress getOrderAddress(Long addressId) {
        if (addressId == null) {
            return null;
        }
        
        try {
            return orderAddressRepository.findById(addressId.intValue()).orElse(null);
        } catch (Exception e) {
            // Log the error but don't break the application
            // System.err.println("Failed to retrieve order address: " + e.getMessage());
            return null;
        }
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

        // Add order address details if available
        OrderAddress orderAddress = getOrderAddress(order.getAddressId());
        if (orderAddress != null) {
            dto.setOrderAddress(convertAddressToDTO(orderAddress));
        }

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
    
    private OrderAddressDTO convertAddressToDTO(OrderAddress address) {
        return OrderAddressDTO.builder()
                .id(address.getId())
                .name(address.getName())
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhone())
                .streetAddress(address.getStreetAddress())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
    }
} 