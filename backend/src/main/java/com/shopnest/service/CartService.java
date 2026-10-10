package com.shopnest.service;

import com.shopnest.dto.CartItemRequest;
import com.shopnest.dto.CartItemResponse;
import com.shopnest.dto.CartResponse;
import com.shopnest.entity.CartItem;
import com.shopnest.entity.Product;
import com.shopnest.entity.User;
import com.shopnest.exception.BadRequestException;
import com.shopnest.exception.InsufficientStockException;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.repository.CartItemRepository;
import com.shopnest.repository.ProductRepository;
import com.shopnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        return buildCartResponse(cartItems);
    }

    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStock() <= 0) {
            throw new InsufficientStockException("Product '" + product.getName() + "' is out of stock");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStock()) {
                throw new InsufficientStockException("Requested total quantity (" + newQuantity + 
                        ") exceeds available stock (" + product.getStock() + ")");
            }

            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > product.getStock()) {
                throw new InsufficientStockException("Requested quantity (" + request.getQuantity() + 
                        ") exceeds available stock (" + product.getStock() + ")");
            }

            CartItem newItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();

            cartItemRepository.save(newItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long userId, Long itemId, int quantity) {
        if (quantity <= 0) {
            return removeCartItem(userId, itemId);
        }

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        if (quantity > item.getProduct().getStock()) {
            throw new InsufficientStockException("Requested quantity (" + quantity + 
                    ") exceeds available stock (" + item.getProduct().getStock() + ")");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCart(userId);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartResponse buildCartResponse(List<CartItem> cartItems) {
        List<CartItemResponse> itemResponses = cartItems.stream().map(item -> {
            BigDecimal price = item.getProduct().getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            return CartItemResponse.builder()
                    .id(item.getId())
                    .product(productService.mapToResponse(item.getProduct()))
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal totalAmount = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(itemResponses)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }
}
