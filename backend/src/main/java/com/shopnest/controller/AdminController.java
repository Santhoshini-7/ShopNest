package com.shopnest.controller;

import com.shopnest.dto.*;
import com.shopnest.service.AdminService;
import com.shopnest.service.CloudinaryService;
import com.shopnest.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request,
            Authentication authentication
    ) {
        UserDto updated = adminService.updateUserRole(id, request.getRole(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("User role updated to " + request.getRole(), updated));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<OrderResponse> orders = orderService.getAllOrders(page, size);
        return ResponseEntity.ok(ApiResponse.success("Admin orders retrieved", orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse updated = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + request.getStatus(), updated));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadProductImage(
            @RequestParam("file") MultipartFile file
    ) {
        ImageUploadResponse response = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }
}
