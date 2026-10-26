package com.brewmaster.service.interfaces;

import com.brewmaster.dto.request.ProductRequest;
import com.brewmaster.dto.response.ProductResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long productId);

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> getAvailableProducts();

    ProductResponse updateProduct(Long productId, ProductRequest request);

    void deleteProduct(Long productId);

    List<ProductResponse> searchProductsByName(String name);

    Page<ProductResponse> getProductsPaginated(int page, int size, String sortBy, String direction);
}