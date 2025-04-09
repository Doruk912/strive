package com.strive.backend.service;

import com.strive.backend.dto.FeaturedCategoryDTO;
import com.strive.backend.model.Category;
import com.strive.backend.model.FeaturedCategory;
import com.strive.backend.repository.CategoryRepository;
import com.strive.backend.repository.FeaturedCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeaturedCategoryService {

    @Autowired
    private FeaturedCategoryRepository featuredCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<FeaturedCategoryDTO> getAllFeaturedCategories() {
        return featuredCategoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeaturedCategoryDTO addFeaturedCategory(Long categoryId) {
        // Check if we already have 6 featured categories
        if (featuredCategoryRepository.count() >= 6) {
            throw new IllegalStateException("Maximum number of featured categories (6) has been reached");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // Get the next display order
        Integer maxDisplayOrder = featuredCategoryRepository.findMaxDisplayOrder();
        int nextDisplayOrder = (maxDisplayOrder == null) ? 1 : maxDisplayOrder + 1;

        FeaturedCategory featuredCategory = new FeaturedCategory();
        featuredCategory.setCategory(category);
        featuredCategory.setDisplayOrder(nextDisplayOrder);

        return convertToDTO(featuredCategoryRepository.save(featuredCategory));
    }

    @Transactional
    public void removeFeaturedCategory(Long id) {
        FeaturedCategory featuredCategory = featuredCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Featured category not found"));
        
        // Get the removed category's display order
        int removedOrder = featuredCategory.getDisplayOrder();
        
        // Delete the featured category
        featuredCategoryRepository.delete(featuredCategory);
        
        // Reorder remaining categories
        featuredCategoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .filter(fc -> fc.getDisplayOrder() > removedOrder)
                .forEach(fc -> {
                    fc.setDisplayOrder(fc.getDisplayOrder() - 1);
                    featuredCategoryRepository.save(fc);
                });
    }

    @Transactional
    public void updateDisplayOrder(Long id, String direction) {
        FeaturedCategory featuredCategory = featuredCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Featured category not found"));

        int currentOrder = featuredCategory.getDisplayOrder();
        int newOrder;

        if ("up".equals(direction) && currentOrder > 1) {
            newOrder = currentOrder - 1;
        } else if ("down".equals(direction) && currentOrder < featuredCategoryRepository.count()) {
            newOrder = currentOrder + 1;
        } else {
            return; // No change needed
        }

        // Find the category to swap with
        FeaturedCategory categoryToSwap = featuredCategoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .filter(fc -> fc.getDisplayOrder() == newOrder)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Category to swap not found"));

        // Swap display orders
        categoryToSwap.setDisplayOrder(currentOrder);
        featuredCategory.setDisplayOrder(newOrder);

        featuredCategoryRepository.save(categoryToSwap);
        featuredCategoryRepository.save(featuredCategory);
    }

    private String buildCategoryPath(Category category) {
        List<String> pathParts = new ArrayList<>();
        Category current = category;
        
        // Add the current category's name first
        pathParts.add(current.getName());
        
        // Then traverse up the parent hierarchy
        while (current.getParent() != null) {
            current = current.getParent();
            pathParts.add(0, current.getName());
        }
        
        return String.join(" → ", pathParts);
    }

    private FeaturedCategoryDTO convertToDTO(FeaturedCategory featuredCategory) {
        FeaturedCategoryDTO dto = new FeaturedCategoryDTO();
        dto.setId(featuredCategory.getId());
        dto.setCategoryId(featuredCategory.getCategory().getId());
        dto.setName(featuredCategory.getCategory().getName());
        dto.setDisplayOrder(featuredCategory.getDisplayOrder());

        // Set parent path if category has a parent
        if (featuredCategory.getCategory().getParent() != null) {
            dto.setParentPath(buildCategoryPath(featuredCategory.getCategory()));
        }

        if (featuredCategory.getCategory().getImageData() != null) {
            dto.setImageBase64(Base64.getEncoder().encodeToString(featuredCategory.getCategory().getImageData()));
            dto.setImageType(featuredCategory.getCategory().getImageType());
        }

        return dto;
    }
} 