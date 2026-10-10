package com.shopnest.controller;

import com.shopnest.dto.ApiResponse;
import com.shopnest.dto.CartItemRequest;
import com.shopnest.dto.CartResponse;
import com.shopnest.security.UserPrincipal;
import com.shopnest.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartResponse cart = cartService.getCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartItemRequest request
    ) {
        CartResponse cart = cartService.addToCart(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItemQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> request
    ) {
        Integer quantity = request.get("quantity");
        if (quantity == null) {
            quantity = 1;
        }
        CartResponse cart = cartService.updateCartItemQuantity(principal.getId(), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cart));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId
    ) {
        CartResponse cart = cartService.removeCartItem(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
