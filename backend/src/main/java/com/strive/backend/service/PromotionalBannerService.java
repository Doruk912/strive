package com.strive.backend.service;

import com.strive.backend.dto.PromotionalBannerDTO;
import com.strive.backend.model.PromotionalBanner;
import com.strive.backend.repository.PromotionalBannerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromotionalBannerService {

    @Autowired
    private PromotionalBannerRepository promotionalBannerRepository;

    /**
     * Get all banners ordered by display order
     */
    public List<PromotionalBannerDTO> getAllBanners() {
        return promotionalBannerRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(PromotionalBannerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get only active banners ordered by display order
     */
    public List<PromotionalBannerDTO> getActiveBanners() {
        return promotionalBannerRepository.findByActiveIsTrueOrderByDisplayOrderAsc()
                .stream()
                .map(PromotionalBannerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a single banner by id
     */
    public PromotionalBannerDTO getBannerById(Integer id) {
        PromotionalBanner banner = promotionalBannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner not found with id: " + id));
        return PromotionalBannerDTO.fromEntity(banner);
    }

    /**
     * Create a new banner
     */
    @Transactional
    public PromotionalBannerDTO createBanner(PromotionalBannerDTO bannerDTO) {
        PromotionalBanner banner = new PromotionalBanner();
        updateBannerFromDTO(banner, bannerDTO);
        
        // Set the display order to max + 1 if not provided
        if (banner.getDisplayOrder() == null) {
            Integer maxOrder = promotionalBannerRepository.findAll().stream()
                    .map(PromotionalBanner::getDisplayOrder)
                    .max(Integer::compareTo)
                    .orElse(0);
            banner.setDisplayOrder(maxOrder + 1);
        }
        
        PromotionalBanner savedBanner = promotionalBannerRepository.save(banner);
        return PromotionalBannerDTO.fromEntity(savedBanner);
    }

    /**
     * Update an existing banner
     */
    @Transactional
    public PromotionalBannerDTO updateBanner(Integer id, PromotionalBannerDTO bannerDTO) {
        PromotionalBanner banner = promotionalBannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner not found with id: " + id));
        
        updateBannerFromDTO(banner, bannerDTO);
        PromotionalBanner savedBanner = promotionalBannerRepository.save(banner);
        return PromotionalBannerDTO.fromEntity(savedBanner);
    }

    /**
     * Delete a banner
     */
    @Transactional
    public void deleteBanner(Integer id) {
        if (!promotionalBannerRepository.existsById(id)) {
            throw new EntityNotFoundException("Banner not found with id: " + id);
        }
        promotionalBannerRepository.deleteById(id);
    }

    /**
     * Update banner active status
     */
    @Transactional
    public PromotionalBannerDTO updateBannerActive(Integer id, Boolean active) {
        PromotionalBanner banner = promotionalBannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner not found with id: " + id));
        
        banner.setActive(active);
        PromotionalBanner savedBanner = promotionalBannerRepository.save(banner);
        return PromotionalBannerDTO.fromEntity(savedBanner);
    }

    /**
     * Update banner display order
     */
    @Transactional
    public PromotionalBannerDTO updateBannerOrder(Integer id, Integer newOrder) {
        PromotionalBanner banner = promotionalBannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner not found with id: " + id));
        
        Integer oldOrder = banner.getDisplayOrder();
        
        // Only proceed if there's an actual change
        if (oldOrder != null && !oldOrder.equals(newOrder)) {
            // Check if there's another banner with the target order
            PromotionalBanner conflictingBanner = promotionalBannerRepository.findByDisplayOrder(newOrder);
            
            // If there's a conflict and it's not the same banner
            if (conflictingBanner != null && !conflictingBanner.getId().equals(id)) {
                // Temporarily set the conflicting banner to null to avoid unique constraint
                conflictingBanner.setDisplayOrder(-1);
                promotionalBannerRepository.save(conflictingBanner);
                
                // Update our banner
                banner.setDisplayOrder(newOrder);
                banner = promotionalBannerRepository.save(banner);
                
                // Now that we've updated our banner, update the other one 
                conflictingBanner.setDisplayOrder(oldOrder);
                promotionalBannerRepository.save(conflictingBanner);
            } else {
                // No conflict, just update
                banner.setDisplayOrder(newOrder);
                banner = promotionalBannerRepository.save(banner);
            }
        }
        
        return PromotionalBannerDTO.fromEntity(banner);
    }

    /**
     * Helper method to update banner entity from DTO
     */
    private void updateBannerFromDTO(PromotionalBanner banner, PromotionalBannerDTO dto) {
        banner.setTitle(dto.getTitle());
        banner.setSubtitle(dto.getSubtitle());
        banner.setHighlight(dto.getHighlight());
        banner.setIcon(dto.getIcon());
        banner.setBackgroundColor(dto.getBackgroundColor());
        
        if (dto.getDisplayOrder() != null) {
            banner.setDisplayOrder(dto.getDisplayOrder());
        }
        
        if (dto.getActive() != null) {
            banner.setActive(dto.getActive());
        }
    }
} 