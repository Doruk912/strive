package com.strive.backend.service;

import com.strive.backend.dto.ProductDTO;
import com.strive.backend.dto.ProductImageDTO;
import com.strive.backend.dto.StockDTO;
import com.strive.backend.model.FeaturedProduct;
import com.strive.backend.model.Product;
import com.strive.backend.model.ProductImage;
import com.strive.backend.model.Stock;
import com.strive.backend.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.strive.backend.model.Review;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.HashMap;

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

    public ProductDTO convertToDTO(Product product) {
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

        // Set featured product information
        if (product.getFeaturedProduct() != null) {
            dto.setIsFeatured(true);
            dto.setDisplayOrder(product.getFeaturedProduct().getDisplayOrder());
        } else {
            dto.setIsFeatured(false);
            dto.setDisplayOrder(null);
        }

        // Convert images
        dto.setImages(product.getImages().stream()
                .map(this::convertToImageDTO)
                .collect(Collectors.toList()));

        // Convert stocks
        dto.setStocks(product.getStocks().stream()
                .map(this::convertToStockDTO)
                .collect(Collectors.toList()));

        if (!product.getReviews().isEmpty()) {
                double avgRating = product.getReviews().stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);
                dto.setAverageRating(avgRating);
                dto.setReviewCount(product.getReviews().size());
            }

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

    @Transactional
    public ProductDTO reorderProductImages(Integer productId, List<Integer> imageIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        // Create a map for quick lookup of display order by image ID
        Map<Integer, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < imageIds.size(); i++) {
            orderMap.put(imageIds.get(i), i + 1);
        }

        // Update display order for each image
        product.getImages().forEach(image -> {
            Integer newOrder = orderMap.get(image.getId());
            if (newOrder != null) {
                image.setDisplayOrder(newOrder);
            }
        });

        // Sort images by display order to ensure they're saved in the correct order
        product.getImages().sort(Comparator.comparing(ProductImage::getDisplayOrder));

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findAllByFeaturedProductIsNotNullOrderByFeaturedProductDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO toggleFeaturedProduct(Integer id, Integer displayOrder) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (product.getFeaturedProduct() != null) {
            // Remove from featured
            product.setFeaturedProduct(null);
        } else {
            // Add to featured
            FeaturedProduct featuredProduct = new FeaturedProduct();
            featuredProduct.setProduct(product);
            featuredProduct.setDisplayOrder(displayOrder != null ? displayOrder : getNextDisplayOrder());
            product.setFeaturedProduct(featuredProduct);
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public List<ProductDTO> reorderFeaturedProducts(List<Integer> productIds) {
        List<Product> products = productRepository.findAllById(productIds);
        
        // Create a map of product ID to display order
        Map<Integer, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < productIds.size(); i++) {
            orderMap.put(productIds.get(i), i + 1);
        }
        
        // Update display order for each product
        for (Product product : products) {
            if (product.getFeaturedProduct() == null) {
                // Create new FeaturedProduct if it doesn't exist
                FeaturedProduct featuredProduct = new FeaturedProduct();
                featuredProduct.setProduct(product);
                featuredProduct.setDisplayOrder(orderMap.get(product.getId()));
                product.setFeaturedProduct(featuredProduct);
            } else {
                // Update existing FeaturedProduct
                product.getFeaturedProduct().setDisplayOrder(orderMap.get(product.getId()));
            }
        }

        List<Product> updatedProducts = productRepository.saveAll(products);
        return updatedProducts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Integer getNextDisplayOrder() {
        return productRepository.findMaxFeaturedProductDisplayOrder()
                .map(max -> max + 1)
                .orElse(1);
    }

    public class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;

        public PageResponse(List<T> content, int page, int size, long totalElements) {
            this.content = content;
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        }

        // Getters
        public List<T> getContent() { return content; }
        public int getPage() { return page; }
        public int getSize() { return size; }
        public long getTotalElements() { return totalElements; }
        public int getTotalPages() { return totalPages; }
    }

    public PageResponse<ProductDTO> getPaginatedProducts(
            int page, int size, String categoryIdsParam, String name,
            Double minPrice, Double maxPrice, Integer minRating, 
            String sizesParam, String sort) {
        
        // Convert string parameters to appropriate types
        List<Integer> categoryIds = categoryIdsParam != null ? 
            List.of(categoryIdsParam.split(",")).stream()
                .map(Integer::parseInt)
                .collect(Collectors.toList()) : 
            null;
        
        List<String> sizesList = sizesParam != null ? 
            List.of(sizesParam.split(",")) : 
            null;
        
        // Start with all products
        List<Product> allProducts = productRepository.findAll();
        
        // Apply filters
        List<Product> filteredProducts = allProducts.stream()
            .filter(product -> {
                // Category filter
                if (categoryIds != null && !categoryIds.isEmpty() && 
                    !categoryIds.contains(product.getCategoryId())) {
                    return false;
                }
                
                // Name filter
                if (name != null && !name.isEmpty() && 
                    !product.getName().toLowerCase().contains(name.toLowerCase()) &&
                    (product.getDescription() == null || 
                     !product.getDescription().toLowerCase().contains(name.toLowerCase()))) {
                    return false;
                }
                
                // Price range filter
                if (minPrice != null && product.getPrice() < minPrice) {
                    return false;
                }
                if (maxPrice != null && product.getPrice() > maxPrice) {
                    return false;
                }
                
                // Rating filter
                if (minRating != null && minRating > 0) {
                    double avgRating = product.getReviews().stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);
                    if (avgRating < minRating) {
                        return false;
                    }
                }
                
                // Size filter
                if (sizesList != null && !sizesList.isEmpty()) {
                    boolean hasSizes = product.getStocks().stream()
                        .anyMatch(stock -> sizesList.contains(stock.getSize()) && stock.getQuantity() > 0);
                    if (!hasSizes) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Apply sorting
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "price-low-high":
                    filteredProducts.sort(Comparator.comparing(Product::getPrice));
                    break;
                case "price-high-low":
                    filteredProducts.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
                case "name-a-z":
                    filteredProducts.sort(Comparator.comparing(Product::getName));
                    break;
                case "name-z-a":
                    filteredProducts.sort(Comparator.comparing(Product::getName).reversed());
                    break;
                case "rating-high-low":
                    filteredProducts.sort((p1, p2) -> {
                        double rating1 = p1.getReviews().stream()
                            .mapToInt(Review::getRating).average().orElse(0.0);
                        double rating2 = p2.getReviews().stream()
                            .mapToInt(Review::getRating).average().orElse(0.0);
                        return Double.compare(rating2, rating1);
                    });
                    break;
            }
        }
        
        // Calculate total filtered count
        long totalElements = filteredProducts.size();
        
        // Calculate total pages
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        
        // Fix the fromIndex and toIndex calculation
        int fromIndex = Math.min(page * size, filteredProducts.size());
        int toIndex = Math.min(fromIndex + size, filteredProducts.size());
        
        // Handle out of bounds - if the page is beyond available data, return the last page
        if (totalElements > 0 && fromIndex >= filteredProducts.size()) {
            page = totalPages - 1; // Last valid page (0-based)
            fromIndex = page * size;
            toIndex = Math.min(fromIndex + size, filteredProducts.size());
        }
        
        List<Product> pagedProducts = filteredProducts.isEmpty() ? 
            List.of() : 
            filteredProducts.subList(fromIndex, toIndex);
        
        // Convert to DTOs
        List<ProductDTO> productDTOs = pagedProducts.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        return new PageResponse<>(productDTOs, page, size, totalElements);
    }
}
