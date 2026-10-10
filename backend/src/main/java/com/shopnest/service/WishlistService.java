package com.shopnest.service;

import com.shopnest.dto.WishlistItemResponse;
import com.shopnest.entity.Product;
import com.shopnest.entity.User;
import com.shopnest.entity.WishlistItem;
import com.shopnest.exception.BadRequestException;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.repository.ProductRepository;
import com.shopnest.repository.UserRepository;
import com.shopnest.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(item -> WishlistItemResponse.builder()
                        .id(item.getId())
                        .product(productService.mapToResponse(item.getProduct()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemResponse addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product is already in your wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        WishlistItem saved = wishlistRepository.save(item);

        return WishlistItemResponse.builder()
                .id(saved.getId())
                .product(productService.mapToResponse(product))
                .build();
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Product not found in your wishlist");
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
