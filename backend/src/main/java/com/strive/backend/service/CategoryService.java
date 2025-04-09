package com.strive.backend.service;

import com.strive.backend.dto.CategoryDTO;
import com.strive.backend.model.Category;
import com.strive.backend.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Category category = new Category();
        category.setName(categoryDTO.getName());

        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        if (image != null && !image.isEmpty()) {
            category.setImageData(image.getBytes());
            category.setImageType(image.getContentType());
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        category.setName(categoryDTO.getName());

        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        if (categoryDTO.isRemoveImage()) {
            category.setImageData(null);
            category.setImageType(null);
        } else if (image != null && !image.isEmpty()) {
            category.setImageData(image.getBytes());
            category.setImageType(image.getContentType());
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }

        if (category.getImageData() != null) {
            dto.setImageBase64(Base64.getEncoder().encodeToString(category.getImageData()));
            dto.setImageType(category.getImageType());
        }

        List<Category> children = categoryRepository.findByParentId(category.getId());
        dto.setChildren(children.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));

        return dto;
    }
} 