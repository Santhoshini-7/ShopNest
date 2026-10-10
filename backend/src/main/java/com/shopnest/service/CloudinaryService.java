package com.shopnest.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.shopnest.dto.ImageUploadResponse;
import com.shopnest.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    public ImageUploadResponse uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select an image file to upload");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files (JPEG, PNG, WEBP, etc.) are allowed");
        }

        // Check if Cloudinary credentials are configured
        if (cloudName != null && !cloudName.isBlank() && apiKey != null && !apiKey.isBlank()) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "shopnest/products",
                                "resource_type", "image"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");
                log.info("Uploaded image to Cloudinary: {}", secureUrl);
                return new ImageUploadResponse(secureUrl, publicId);
            } catch (IOException ex) {
                log.error("Cloudinary upload failed: {}", ex.getMessage());
                throw new BadRequestException("Failed to upload image to Cloudinary: " + ex.getMessage());
            }
        }

        // Resilient Fallback: Store locally in uploads directory if Cloudinary credentials not configured
        try {
            String uploadDir = "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID() + extension;
            Path filePath = Paths.get(uploadDir, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String localUrl = "/uploads/" + uniqueFilename;
            log.info("Cloudinary credentials not set; stored image locally at {}", localUrl);
            return new ImageUploadResponse(localUrl, uniqueFilename);
        } catch (IOException e) {
            log.error("Local file storage fallback failed: {}", e.getMessage());
            throw new BadRequestException("Failed to store image: " + e.getMessage());
        }
    }
}
