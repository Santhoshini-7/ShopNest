package com.shopnest.dto;

import com.shopnest.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private OrderStatus status;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime returnEligibleUntil;
    private List<OrderItemResponse> items;
}
