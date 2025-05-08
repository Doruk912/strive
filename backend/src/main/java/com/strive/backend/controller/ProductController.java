package com.strive.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.strive.backend.dto.ProductDTO;
import com.strive.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.createProduct(productDTO, null));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProductWithImages(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        return ResponseEntity.ok(productService.createProduct(productDTO, images));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Integer id,
            @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO, null));
    }

    @PutMapping(value = "/{id}/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProductWithImages(
            @PathVariable Integer id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        return ResponseEntity.ok(productService.updateProduct(id, productDTO, images));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<Void> deleteProductImage(
            @PathVariable Integer productId,
            @PathVariable Integer imageId) {
        productService.deleteProductImage(productId, imageId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProductDTO> updateProductStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        return ResponseEntity.ok(productService.updateProductStatus(id, status));
    }

    @PutMapping("/{productId}/images/reorder")
    public ResponseEntity<ProductDTO> reorderProductImages(
            @PathVariable Integer productId,
            @RequestBody List<Integer> imageIds) {
        return ResponseEntity.ok(productService.reorderProductImages(productId, imageIds));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @PutMapping("/{id}/featured")
    public ResponseEntity<ProductDTO> toggleFeaturedProduct(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer displayOrder) {
        return ResponseEntity.ok(productService.toggleFeaturedProduct(id, displayOrder));
    }

    @PutMapping("/featured/reorder")
    public ResponseEntity<List<ProductDTO>> reorderFeaturedProducts(
            @RequestBody List<Integer> productIds) {
        return ResponseEntity.ok(productService.reorderFeaturedProducts(productIds));
    }

    @GetMapping("/paginated")
    public ResponseEntity<?> getPaginatedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String categoryIds,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) String sizes,
            @RequestParam(required = false) String sort) {
        
        return ResponseEntity.ok(productService.getPaginatedProducts(
            page, size, categoryIds, name, minPrice, maxPrice, minRating, sizes, sort));
    }
}