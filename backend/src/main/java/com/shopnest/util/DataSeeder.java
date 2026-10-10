package com.shopnest.util;

import com.shopnest.entity.*;
import com.shopnest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategoriesAndProducts();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@shopnest.com")) {
            User admin = User.builder()
                    .name("ShopNest Administrator")
                    .email("admin@shopnest.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin created: admin@shopnest.com / Admin@123");
        }

        if (!userRepository.existsByEmail("user@shopnest.com")) {
            User user = User.builder()
                    .name("Demo Customer")
                    .email("user@shopnest.com")
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.info("Default User created: user@shopnest.com / User@123");
        }
    }

    private void seedCategoriesAndProducts() {
        if (categoryRepository.count() == 0) {
            Category electronics = categoryRepository.save(Category.builder()
                    .name("Electronics")
                    .description("Laptops, smartphones, audio gear, and gadgets")
                    .build());

            Category fashion = categoryRepository.save(Category.builder()
                    .name("Fashion")
                    .description("Trendy apparel, footwear, and accessories")
                    .build());

            Category homeLiving = categoryRepository.save(Category.builder()
                    .name("Home & Living")
                    .description("Furniture, home decor, kitchenware, and lighting")
                    .build());

            Category beauty = categoryRepository.save(Category.builder()
                    .name("Beauty & Personal Care")
                    .description("Skincare, haircare, cosmetics, and wellness")
                    .build());

            Category sports = categoryRepository.save(Category.builder()
                    .name("Sports & Outdoors")
                    .description("Fitness equipment, activewear, and outdoor gear")
                    .build());

            log.info("Default categories seeded");

            List<Product> products = Arrays.asList(
                    // Electronics
                    Product.builder()
                            .name("Sony WH-1000XM5 Wireless Headphones")
                            .description("Industry-leading noise canceling headphones with dual processors and 8 microphones for unparalleled sound clarity and comfort.")
                            .price(new BigDecimal("349.99"))
                            .stock(25)
                            .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80")
                            .category(electronics)
                            .build(),
                    Product.builder()
                            .name("Apple MacBook Pro 14\" M3")
                            .description("Supercharged by the M3 chip with 8-core CPU and 10-core GPU. Stunning Liquid Retina XDR display and all-day battery life.")
                            .price(new BigDecimal("1599.00"))
                            .stock(15)
                            .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80")
                            .category(electronics)
                            .build(),
                    Product.builder()
                            .name("Logitech MX Master 3S Wireless Mouse")
                            .description("Quiet click ergonomic mouse with 8K DPI sensor that tracks on glass, ultra-fast MagSpeed scrolling, and multi-device flow.")
                            .price(new BigDecimal("99.99"))
                            .stock(50)
                            .imageUrl("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80")
                            .category(electronics)
                            .build(),
                    Product.builder()
                            .name("Keychron K2 Mechanical Keyboard")
                            .description("Wireless Bluetooth mechanical keyboard with RGB backlighting, hot-swappable switches, and compact 75% layout.")
                            .price(new BigDecimal("89.50"))
                            .stock(30)
                            .imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80")
                            .category(electronics)
                            .build(),

                    // Fashion
                    Product.builder()
                            .name("Classic Tailored Wool Overcoat")
                            .description("Premium Italian wool blend coat with notched lapels and satin interior lining. Timeless cold-weather elegance.")
                            .price(new BigDecimal("219.00"))
                            .stock(20)
                            .imageUrl("https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80")
                            .category(fashion)
                            .build(),
                    Product.builder()
                            .name("Urban Minimalist Leather Sneakers")
                            .description("Handcrafted full-grain leather sneakers with cushioned memory-foam insole and durable rubber cupsole.")
                            .price(new BigDecimal("129.95"))
                            .stock(40)
                            .imageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80")
                            .category(fashion)
                            .build(),
                    Product.builder()
                            .name("Polarized Classic Aviator Sunglasses")
                            .description("Lightweight stainless steel frame with scratch-resistant polarized lenses providing 100% UV400 sun protection.")
                            .price(new BigDecimal("55.00"))
                            .stock(65)
                            .imageUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80")
                            .category(fashion)
                            .build(),

                    // Home & Living
                    Product.builder()
                            .name("Ceramic Matte Pour-Over Coffee Set")
                            .description("Artisan handcrafted dripper with thermal insulated glass carafe. Brew barista-grade specialty coffee at home.")
                            .price(new BigDecimal("48.00"))
                            .stock(35)
                            .imageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80")
                            .category(homeLiving)
                            .build(),
                    Product.builder()
                            .name("Aromatherapy Essential Oil Diffuser")
                            .description("Ultrasonic cool mist diffuser with ambient LED mood lighting and whisper-quiet operation for tranquil living spaces.")
                            .price(new BigDecimal("36.50"))
                            .stock(45)
                            .imageUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80")
                            .category(homeLiving)
                            .build(),
                    Product.builder()
                            .name("Minimalist Nordic Wooden Desk Lamp")
                            .description("Solid beechwood arm with powder-coated aluminum shade and touch-dimmable warm LED illumination.")
                            .price(new BigDecimal("74.99"))
                            .stock(18)
                            .imageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80")
                            .category(homeLiving)
                            .build(),

                    // Beauty
                    Product.builder()
                            .name("Hydrating Botanical Facial Serum")
                            .description("Nourishing vitamin C and hyaluronic acid antioxidant serum for vibrant, smooth, and glowing skin complexion.")
                            .price(new BigDecimal("42.00"))
                            .stock(80)
                            .imageUrl("https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80")
                            .category(beauty)
                            .build(),

                    // Sports
                    Product.builder()
                            .name("Pro Anti-Slip Eco Yoga Mat")
                            .description("Biodegradable natural tree rubber mat with alignment guidelines and superior joint cushioning.")
                            .price(new BigDecimal("68.00"))
                            .stock(28)
                            .imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80")
                            .category(sports)
                            .build()
            );

            productRepository.saveAll(products);
            log.info("Default sample products seeded successfully");
        }
    }
}
