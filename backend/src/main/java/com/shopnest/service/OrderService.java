package com.shopnest.service;

import com.shopnest.dto.OrderItemResponse;
import com.shopnest.dto.OrderRequest;
import com.shopnest.dto.OrderResponse;
import com.shopnest.entity.*;
import com.shopnest.exception.BadRequestException;
import com.shopnest.exception.InsufficientStockException;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.exception.UnauthorizedException;
import com.shopnest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    public static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("1000.00");
    public static final BigDecimal DELIVERY_CHARGE = new BigDecimal("50.00");
    public static final int RETURN_WINDOW_DAYS = 30;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add items to your cart before checking out.");
        }

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getStock() + ", Requested: " + cartItem.getQuantity());
            }
        }

        BigDecimal itemsTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal itemPrice = product.getPrice();
            BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            itemsTotal = itemsTotal.add(itemSubtotal);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            orderItems.add(OrderItem.builder()
                    .order(null)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(itemPrice)
                    .build());
        }

        BigDecimal deliveryCharge = itemsTotal.compareTo(FREE_DELIVERY_THRESHOLD) < 0
                ? DELIVERY_CHARGE : BigDecimal.ZERO;
        BigDecimal totalAmount = itemsTotal.add(deliveryCharge);

        Order order = Order.builder()
                .user(user)
                .address(request.getAddress().trim())
                .status(OrderStatus.PLACED)
                .totalAmount(totalAmount)
                .deliveryCharge(deliveryCharge)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);
        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this order");
        }
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.RETURNED) {
            throw new BadRequestException("A " + currentStatus + " order cannot be changed.");
        }
        if (currentStatus == OrderStatus.DELIVERED && newStatus != OrderStatus.RETURN_REQUESTED) {
            throw new BadRequestException("A delivered order can only move to return requested through the customer return flow.");
        }
        if (currentStatus == OrderStatus.RETURN_REQUESTED) {
            if (newStatus != OrderStatus.RETURNED) {
                throw new BadRequestException("A return request can only be marked as returned.");
            }
            restoreStock(order);
            order.setStatus(OrderStatus.RETURNED);
        } else if (newStatus == OrderStatus.CANCELLED) {
            if (currentStatus != OrderStatus.PLACED) {
                throw new BadRequestException("An order cannot be cancelled after it has been shipped.");
            }
            restoreStock(order);
            order.setStatus(OrderStatus.CANCELLED);
        } else if (newStatus == OrderStatus.DELIVERED) {
            if (currentStatus != OrderStatus.SHIPPED) {
                throw new BadRequestException("An order must be shipped before it can be marked as delivered.");
            }
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.SHIPPED) {
            if (currentStatus != OrderStatus.PLACED) {
                throw new BadRequestException("Only placed orders can be marked as shipped.");
            }
            order.setStatus(OrderStatus.SHIPPED);
        } else {
            throw new BadRequestException("Invalid order status transition.");
        }

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to cancel this order");
        }
        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Orders can only be cancelled before they are shipped.");
        }
        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse requestReturn(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to return this order");
        }
        if (order.getStatus() != OrderStatus.DELIVERED || order.getDeliveredAt() == null) {
            throw new BadRequestException("Returns are available only after an order has been delivered.");
        }
        LocalDateTime deadline = order.getDeliveredAt().plusDays(RETURN_WINDOW_DAYS);
        if (LocalDateTime.now().isAfter(deadline)) {
            throw new BadRequestException("The 30-day return window for this order has expired.");
        }
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        return mapToResponse(orderRepository.save(order));
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    public OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream().map(item -> {
            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productImageUrl(item.getProduct().getImageUrl())
                    .price(item.getPrice())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        LocalDateTime returnEligibleUntil = order.getDeliveredAt() == null
                ? null : order.getDeliveredAt().plusDays(RETURN_WINDOW_DAYS);

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge() == null ? BigDecimal.ZERO : order.getDeliveryCharge())
                .status(order.getStatus())
                .address(order.getAddress())
                .createdAt(order.getCreatedAt())
                .deliveredAt(order.getDeliveredAt())
                .returnEligibleUntil(returnEligibleUntil)
                .items(itemResponses)
                .build();
    }
}
