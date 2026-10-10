package com.shopnest.service;

import com.shopnest.dto.AuthResponse;
import com.shopnest.dto.LoginRequest;
import com.shopnest.dto.RegisterRequest;
import com.shopnest.dto.UserDto;
import com.shopnest.entity.Role;
import com.shopnest.entity.User;
import com.shopnest.exception.BadRequestException;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.repository.UserRepository;
import com.shopnest.security.JwtService;
import com.shopnest.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered. Please login or use another email.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(savedUser);
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(principal.getUser()))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(UserPrincipal principal, String name) {
        if (name == null || name.trim().length() < 2) {
            throw new BadRequestException("Name must be at least 2 characters long");
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
        user.setName(name.trim());
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
