package com.strive.backend.dto;

import com.strive.backend.model.PromotionalBanner;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionalBannerDTO {
    private Integer id;
    private String title;
    private String subtitle;
    private String highlight;
    private String icon;
    private String backgroundColor;
    private Integer displayOrder;
    private Boolean active;
    
    public static PromotionalBannerDTO fromEntity(PromotionalBanner banner) {
        PromotionalBannerDTO dto = new PromotionalBannerDTO();
        dto.setId(banner.getId());
        dto.setTitle(banner.getTitle());
        dto.setSubtitle(banner.getSubtitle());
        dto.setHighlight(banner.getHighlight());
        dto.setIcon(banner.getIcon());
        dto.setBackgroundColor(banner.getBackgroundColor());
        dto.setDisplayOrder(banner.getDisplayOrder());
        dto.setActive(banner.getActive());
        return dto;
    }
} 