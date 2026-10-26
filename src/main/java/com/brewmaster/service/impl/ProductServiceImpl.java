package com.brewmaster.service.impl;

import com.brewmaster.dto.request.ProductRequest;
import com.brewmaster.dto.response.ProductResponse;
import com.brewmaster.entity.Category;
import com.brewmaster.entity.Product;
import com.brewmaster.exception.CategoryNotFoundException;
import com.brewmaster.exception.ProductAlreadyExistsException;
import com.brewmaster.exception.ProductNotFoundException;
import com.brewmaster.mapper.ProductMapper;
import com.brewmaster.repository.CategoryRepository;
import com.brewmaster.repository.ProductRepository;
import com.brewmaster.service.interfaces.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        if (productRepository.existsByNameIgnoreCaseAndDeletedFalse(request.getName())) {
            throw new ProductAlreadyExistsException(
                    "Product already exists with name: " + request.getName()
            );
        }

        Category category = categoryRepository.findByIdAndDeletedFalseAndActiveTrue(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + request.getCategoryId()
                        )
                );

        if (!category.getActive()) {
            throw new IllegalArgumentException(
                    "Category is inactive: " + category.getName()
            );
        }

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setAvailable(request.getAvailable());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findByDeletedFalse()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductById(Long productId) {

        Product product = productRepository.findById(productId)
                .filter(p -> !Boolean.TRUE.equals(p.getDeleted()))
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        return productMapper.toResponse(product);

    }


    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryIdAndDeletedFalse(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getAvailableProducts() {

        return productRepository.findByAvailableTrueAndDeletedFalse()
                .stream()
                .map(productMapper::toResponse)
                .toList();

    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {

        return productRepository.findByNameContainingIgnoreCaseAndDeletedFalse(name)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public Page<ProductResponse> getProductsPaginated(int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.findByDeletedFalse(pageable)
                .map(productMapper::toResponse);
    }

    @Override
    public ProductResponse updateProduct(
            Long productId,
            ProductRequest request) {

        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (!product.getName().equalsIgnoreCase(request.getName())
                && productRepository.existsByNameIgnoreCaseAndDeletedFalse(request.getName())) {

            throw new ProductAlreadyExistsException(
                    "Product already exists with name: " + request.getName()
            );
        }

        Category category = categoryRepository.findByIdAndDeletedFalseAndActiveTrue(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + request.getCategoryId()
                        )
                );

        if (!category.getActive()) {
            throw new IllegalArgumentException(
                    "Category is inactive: " + category.getName()
            );
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setAvailable(request.getAvailable());
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long productId) {

        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        product.setAvailable(false);
        product.setDeleted(true);

        productRepository.save(product);
    }
}