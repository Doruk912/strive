package com.strive.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.strive.backend.dto.CategoryDTO;
import com.strive.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) throws IOException {
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO, null));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryDTO> createCategoryWithImage(
            @RequestPart("category") String categoryJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        CategoryDTO categoryDTO = objectMapper.readValue(categoryJson, CategoryDTO.class);
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO, image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDTO categoryDTO) throws IOException {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO, null));
    }

    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryDTO> updateCategoryWithImage(
            @PathVariable Long id,
            @RequestPart("category") String categoryJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        CategoryDTO categoryDTO = objectMapper.readValue(categoryJson, CategoryDTO.class);
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
} 