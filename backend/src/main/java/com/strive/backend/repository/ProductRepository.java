package com.strive.backend.repository;

import com.strive.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findAllByFeaturedProductIsNotNullOrderByFeaturedProductDisplayOrderAsc();

    @Query("SELECT MAX(fp.displayOrder) FROM Product p JOIN p.featuredProduct fp")
    Optional<Integer> findMaxFeaturedProductDisplayOrder();
}