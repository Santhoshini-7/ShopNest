package com.shopnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long returnRequestedOrders;
    private long returnedOrders;
    private Map<String, Long> statusCounts;
    private List<OrderResponse> recentOrders;
}
