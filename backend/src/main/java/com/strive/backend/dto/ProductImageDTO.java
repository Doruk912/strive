package com.strive.backend.dto;

import lombok.Data;

@Data
public class ProductImageDTO {
    private Integer id;
    private String imageBase64;
    private String imageType;
    private Integer displayOrder;
} 