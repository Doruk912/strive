package com.strive.backend.controller;

import com.strive.backend.dto.FeaturedCategoryDTO;
import com.strive.backend.service.FeaturedCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/featured-categories")
public class FeaturedCategoryController {

    @Autowired
    private FeaturedCategoryService featuredCategoryService;

    @GetMapping
    public ResponseEntity<List<FeaturedCategoryDTO>> getAllFeaturedCategories() {
        return ResponseEntity.ok(featuredCategoryService.getAllFeaturedCategories());
    }

    @PostMapping
    public ResponseEntity<FeaturedCategoryDTO> addFeaturedCategory(@RequestBody Map<String, Long> request) {
        Long categoryId = request.get("categoryId");
        return ResponseEntity.ok(featuredCategoryService.addFeaturedCategory(categoryId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFeaturedCategory(@PathVariable Long id) {
        featuredCategoryService.removeFeaturedCategory(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/order")
    public ResponseEntity<Void> updateDisplayOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String direction = request.get("direction");
        featuredCategoryService.updateDisplayOrder(id, direction);
        return ResponseEntity.ok().build();
    }
} 