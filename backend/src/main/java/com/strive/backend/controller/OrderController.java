package com.strive.backend.controller;

import com.strive.backend.dto.CreateOrderDTO;
import com.strive.backend.dto.OrderResponseDTO;
import com.strive.backend.model.OrderStatus;
import com.strive.backend.model.User;
import com.strive.backend.service.EmailService;
import com.strive.backend.service.OrderService;
import com.strive.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {
    private final OrderService orderService;
    private final UserService userService;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody CreateOrderDTO createOrderDTO) {
        OrderResponseDTO order = orderService.createOrder(createOrderDTO);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@PathVariable Long userId) {
        List<OrderResponseDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long orderId) {
        OrderResponseDTO order = orderService.getOrder(orderId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusUpdate) {
        OrderStatus status = OrderStatus.valueOf(statusUpdate.get("status"));
        OrderResponseDTO order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{orderId}/resend-confirmation")
    public ResponseEntity<?> resendOrderConfirmation(@PathVariable Long orderId) {
        try {
            OrderResponseDTO order = orderService.getOrder(orderId);
            User user = userService.getUserById(order.getUserId().intValue());
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            emailService.sendOrderConfirmationEmail(
                user.getEmail(),
                user.getFirstName(),
                order.getId(),
                order.getTotalAmount().toString()
            );
            
            return ResponseEntity.ok().body(Map.of("message", "Confirmation email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send confirmation email: " + e.getMessage()));
        }
    }
} 