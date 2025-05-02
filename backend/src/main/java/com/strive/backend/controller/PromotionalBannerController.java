package com.strive.backend.controller;

import com.strive.backend.dto.PromotionalBannerDTO;
import com.strive.backend.service.PromotionalBannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "http://localhost:3000")
public class PromotionalBannerController {

    @Autowired
    private PromotionalBannerService bannerService;

    @GetMapping
    public ResponseEntity<List<PromotionalBannerDTO>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionalBannerDTO>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionalBannerDTO> getBannerById(@PathVariable Integer id) {
        return ResponseEntity.ok(bannerService.getBannerById(id));
    }

    @PostMapping
    public ResponseEntity<PromotionalBannerDTO> createBanner(@RequestBody PromotionalBannerDTO bannerDTO) {
        return ResponseEntity.ok(bannerService.createBanner(bannerDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionalBannerDTO> updateBanner(
            @PathVariable Integer id,
            @RequestBody PromotionalBannerDTO bannerDTO) {
        return ResponseEntity.ok(bannerService.updateBanner(id, bannerDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Integer id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<PromotionalBannerDTO> updateBannerActive(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> requestBody) {
        Boolean active = requestBody.get("active");
        return ResponseEntity.ok(bannerService.updateBannerActive(id, active));
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<PromotionalBannerDTO> updateBannerOrder(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> requestBody) {
        // Try to get displayOrder from the request
        Integer displayOrder = null;
        if (requestBody.containsKey("displayOrder")) {
            // Handle both Integer and String types for flexibility
            Object orderObj = requestBody.get("displayOrder");
            if (orderObj instanceof Integer) {
                displayOrder = (Integer) orderObj;
            } else if (orderObj instanceof String) {
                try {
                    displayOrder = Integer.parseInt((String) orderObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
        }
        
        if (displayOrder == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(bannerService.updateBannerOrder(id, displayOrder));
    }
} 