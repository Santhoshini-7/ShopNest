package com.shopnest.service;

import com.shopnest.dto.CategoryResponse;
import com.shopnest.dto.ProductPageResponse;
import com.shopnest.dto.ProductRequest;
import com.shopnest.dto.ProductResponse;
import com.shopnest.entity.Category;
import com.shopnest.entity.Product;
import com.shopnest.exception.ResourceNotFoundException;
import com.shopnest.repository.CategoryRepository;
import com.shopnest.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public ProductPageResponse getAllProducts(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        String requestedSortBy = sortBy == null ? "createdAt" : sortBy;
        String safeSortBy = switch (requestedSortBy) {
            case "name", "price", "stock", "createdAt", "updatedAt" -> requestedSortBy;
            default -> "createdAt";
        };
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 48);
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();

        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
                Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(nameMatch, descMatch));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (inStock != null) {
                if (inStock) {
                    predicates.add(criteriaBuilder.greaterThan(root.get("stock"), 0));
                } else {
                    predicates.add(criteriaBuilder.equal(root.get("stock"), 0));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ProductPageResponse.builder()
                .products(content)
                .pageNo(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null)
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            product.setImageUrl(request.getImageUrl().trim());
        }
        product.setCategory(category);

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    public ProductResponse mapToResponse(Product product) {
        Category category = product.getCategory();
        CategoryResponse catDto = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .category(catDto)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
