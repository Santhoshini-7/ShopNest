package com.shopnest.service;

import com.shopnest.dto.DashboardStatsResponse;
import com.shopnest.dto.OrderResponse;
import com.shopnest.dto.UserDto;
import com.shopnest.entity.OrderStatus;
import com.shopnest.entity.Role;
import com.shopnest.entity.User;
import com.shopnest.exception.BadRequestException;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.repository.OrderRepository;
import com.shopnest.repository.ProductRepository;
import com.shopnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();

        long placed = orderRepository.countByStatus(OrderStatus.PLACED);
        long shipped = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long returnRequested = orderRepository.countByStatus(OrderStatus.RETURN_REQUESTED);
        long returned = orderRepository.countByStatus(OrderStatus.RETURNED);

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("PLACED", placed);
        statusCounts.put("SHIPPED", shipped);
        statusCounts.put("DELIVERED", delivered);
        statusCounts.put("CANCELLED", cancelled);
        statusCounts.put("RETURN_REQUESTED", returnRequested);
        statusCounts.put("RETURNED", returned);

        List<OrderResponse> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(orderService::mapToResponse)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .pendingOrders(placed)
                .shippedOrders(shipped)
                .deliveredOrders(delivered)
                .cancelledOrders(cancelled)
                .returnRequestedOrders(returnRequested)
                .returnedOrders(returned)
                .statusCounts(statusCounts)
                .recentOrders(recentOrders)
                .build();
    }

    @Transactional
    public UserDto updateUserRole(Long userId, Role newRole, String currentAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Prevent the currently logged-in administrator from removing their own admin access.
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail) && newRole != Role.ADMIN) {
            throw new BadRequestException("You cannot remove your own ADMIN role.");
        }

        user.setRole(newRole);
        return authService.mapToDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapToDto)
                .collect(Collectors.toList());
    }
}
