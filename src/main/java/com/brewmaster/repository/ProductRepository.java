package com.brewmaster.repository;

import com.brewmaster.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);

    java.util.Optional<Product> findByIdAndDeletedFalse(Long id);

    List<Product> findByCategoryIdAndDeletedFalse(Long categoryId);

    List<Product> findByAvailableTrueAndDeletedFalse();

    List<Product> findByDeletedFalse();

    Page<Product> findByDeletedFalse(Pageable pageable);

    List<Product> findByNameContainingIgnoreCaseAndDeletedFalse(String name);

    long countByDeletedFalse();

}