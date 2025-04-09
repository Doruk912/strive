package com.strive.backend.dto;

import lombok.Data;

@Data
public class FeaturedCategoryDTO {
    private Long id;
    private Long categoryId;
    private String name;
    private String imageBase64;
    private String imageType;
    private Integer displayOrder;
    private String parentPath;
} 