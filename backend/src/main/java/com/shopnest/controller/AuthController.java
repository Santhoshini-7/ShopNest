package com.shopnest.controller;

import com.shopnest.dto.*;
import com.shopnest.security.UserPrincipal;
import com.shopnest.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success("User registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserDto userDto = authService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.success("User details retrieved", userDto));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request
    ) {
        String name = request.get("name");
        UserDto updated = authService.updateProfile(principal, name);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
