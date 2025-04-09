package com.strive.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.strive.backend.dto.CategoryDTO;
import com.strive.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestPart("category") CategoryDTO categoryDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO, image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody(required = false) CategoryDTO categoryDTO,
            @RequestPart(value = "category", required = false) String categoryJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        
        // If the request is multipart form data
        if (categoryJson != null) {
            ObjectMapper mapper = new ObjectMapper();
            categoryDTO = mapper.readValue(categoryJson, CategoryDTO.class);
        }
        
        // If categoryDTO is still null, create an empty one
        if (categoryDTO == null) {
            categoryDTO = new CategoryDTO();
        }
        
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
} 