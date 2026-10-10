package com.shopnest.controller;

import com.shopnest.dto.ApiResponse;
import com.shopnest.dto.OrderRequest;
import com.shopnest.dto.OrderResponse;
import com.shopnest.entity.Role;
import com.shopnest.security.UserPrincipal;
import com.shopnest.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderRequest request
    ) {
        // Enforce customer-only checkout even if a request bypasses frontend controls.
        if (principal == null || principal.getUser().getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customer accounts can place orders.");
        }
        OrderResponse order = orderService.createOrder(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", order), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<OrderResponse> orders = orderService.getUserOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }


    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse order = orderService.cancelOrder(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse order = orderService.requestReturn(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Return request submitted successfully", order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getUser().getRole() == Role.ADMIN;
        OrderResponse order = orderService.getOrderById(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", order));
    }
}
