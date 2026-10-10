package com.shopnest.repository;

import com.shopnest.entity.Order;
import com.shopnest.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != com.shopnest.entity.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();

    List<Order> findTop10ByOrderByCreatedAtDesc();
}
