package com.strive.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private Long parentId;
    private String imageBase64;
    private String imageType;
    private List<CategoryDTO> children;
    private boolean removeImage;
} 