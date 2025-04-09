package com.strive.backend.service;

import com.strive.backend.dto.ProductDTO;
import com.strive.backend.dto.ProductImageDTO;
import com.strive.backend.dto.StockDTO;
import com.strive.backend.model.Product;
import com.strive.backend.model.ProductImage;
import com.strive.backend.model.Stock;
import com.strive.backend.repository.ProductRepository;
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
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO, List<MultipartFile> images) {
        Product product = new Product();
        updateProductFromDTO(product, productDTO);
        
        if (images != null && !images.isEmpty()) {
            addImagesToProduct(product, images);
        }

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Integer id, ProductDTO productDTO, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        updateProductFromDTO(product, productDTO);
        
        if (images != null && !images.isEmpty()) {
            addImagesToProduct(product, images);
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    @Transactional
    public void deleteProductImage(Integer productId, Integer imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        
        product.getImages().removeIf(image -> image.getId().equals(imageId));
        productRepository.save(product);
    }

    @Transactional
    public ProductDTO updateProductStatus(Integer id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        
        product.setStatus(Product.Status.valueOf(status.toUpperCase()));
        return convertToDTO(productRepository.save(product));
    }

    private void updateProductFromDTO(Product product, ProductDTO dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        
        if (dto.getStatus() != null) {
            product.setStatus(dto.getStatus());
        }

        // Update stocks
        if (dto.getStocks() != null) {
            product.getStocks().clear();
            dto.getStocks().forEach(stockDTO -> {
                Stock stock = new Stock();
                stock.setSize(stockDTO.getSize());
                stock.setQuantity(stockDTO.getStock());
                stock.setProduct(product);
                product.getStocks().add(stock);
            });
        }
    }

    private void addImagesToProduct(Product product, List<MultipartFile> images) {
        int order = product.getImages().size() + 1;
        for (MultipartFile image : images) {
            try {
                ProductImage productImage = new ProductImage();
                productImage.setImageData(image.getBytes());
                productImage.setImageType(image.getContentType());
                productImage.setDisplayOrder(order++);
                productImage.setProduct(product);
                product.getImages().add(productImage);
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image", e);
            }
        }
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategoryId(product.getCategoryId());
        dto.setStatus(product.getStatus());
        
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }

        // Convert images
        dto.setImages(product.getImages().stream()
                .map(this::convertToImageDTO)
                .collect(Collectors.toList()));

        // Convert stocks
        dto.setStocks(product.getStocks().stream()
                .map(this::convertToStockDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private ProductImageDTO convertToImageDTO(ProductImage image) {
        ProductImageDTO dto = new ProductImageDTO();
        dto.setId(image.getId());
        dto.setImageBase64(Base64.getEncoder().encodeToString(image.getImageData()));
        dto.setImageType(image.getImageType());
        dto.setDisplayOrder(image.getDisplayOrder());
        return dto;
    }

    private StockDTO convertToStockDTO(Stock stock) {
        StockDTO dto = new StockDTO();
        dto.setId(stock.getId());
        dto.setSize(stock.getSize());
        dto.setStock(stock.getQuantity());
        return dto;
    }
}