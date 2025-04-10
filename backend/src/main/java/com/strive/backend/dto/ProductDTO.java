package com.strive.backend.dto;

import com.strive.backend.model.Product;
import lombok.Data;
import java.util.List;

@Data
public class ProductDTO {
    private Integer id;
    private String name;
    private String description;
    private Double price;
    private Integer categoryId;
    private String categoryName;
    private Product.Status status;
    private List<ProductImageDTO> images;
    private List<StockDTO> stocks;
    private Boolean isFeatured;
    private Integer displayOrder;
} 