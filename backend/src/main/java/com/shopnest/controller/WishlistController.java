package com.shopnest.controller;

import com.shopnest.dto.ApiResponse;
import com.shopnest.dto.WishlistItemResponse;
import com.shopnest.security.UserPrincipal;
import com.shopnest.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getWishlist(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<WishlistItemResponse> wishlist = wishlistService.getWishlist(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully", wishlist));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addToWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        WishlistItemResponse response = wishlistService.addToWishlist(principal.getId(), productId);
        return new ResponseEntity<>(ApiResponse.success("Product added to wishlist", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        wishlistService.removeFromWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist", null));
    }
}
