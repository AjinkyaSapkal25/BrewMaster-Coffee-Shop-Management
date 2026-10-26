package com.brewmaster.controller;

import com.brewmaster.dto.request.ProductRequest;
import com.brewmaster.dto.response.ProductResponse;
import com.brewmaster.service.interfaces.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Products",
        description = "APIs for managing BrewMaster products"
)
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(
            summary = "Create product",
            description = "Creates a new coffee product in the BrewMaster system."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Product details: name, price and category ID are required. "
                    + "The description is optional and available defaults to true.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed, for example the price is missing or not above 0"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN or MANAGER"),
            @ApiResponse(responseCode = "404", description = "The given category was not found"),
            @ApiResponse(responseCode = "409", description = "A product with this name already exists")
    })
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }

    @Operation(
            summary = "Get all products",
            description = "Retrieves all active BrewMaster products."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @Operation(
            summary = "Get product by ID",
            description = "Retrieves a single active product using its unique ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @Parameter(description = "Unique ID of the product", example = "1")
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }

    @Operation(
            summary = "Get products by category",
            description = "Retrieves all active products belonging to the specified category."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully. The list is empty if the category has no products"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @Parameter(description = "Unique ID of the category", example = "1")
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(categoryId)
        );
    }

    @Operation(
            summary = "Get available products",
            description = "Retrieves all products that are currently available for ordering."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Available products retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/available")
    public ResponseEntity<List<ProductResponse>> getAvailableProducts() {

        return ResponseEntity.ok(
                productService.getAvailableProducts()
        );
    }

    @Operation(
            summary = "Search products by name",
            description = "Searches active products by their name using the provided search keyword."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search completed. The list is empty if nothing matches"),
            @ApiResponse(responseCode = "400", description = "The name parameter is missing"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProductsByName(
            @Parameter(description = "Product name, or part of it, to search for", example = "latte")
            @RequestParam String name) {

        return ResponseEntity.ok(
                productService.searchProductsByName(name)
        );
    }

    @Operation(
            summary = "Get paginated products",
            description = "Retrieves active products using pagination and sorting. "
                    + "The page number, page size, field to sort by, and sort direction can be specified."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Page of products retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProductResponse>> getProductsPaginated(
            @Parameter(description = "Page number, starting from 0", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of products per page", example = "5")
            @RequestParam(defaultValue = "5") int size,
            @Parameter(description = "Product field to sort by, for example id, name or price", example = "name")
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: asc or desc", example = "asc")
            @RequestParam(defaultValue = "asc") String direction) {

        return ResponseEntity.ok(
                productService.getProductsPaginated(page, size, sortBy, direction));
    }

    @Operation(
            summary = "Update product",
            description = "Updates the details of an existing product using its unique ID."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "New product details: name, price and category ID are required.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed, for example the price is not above 0"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN or MANAGER"),
            @ApiResponse(responseCode = "404", description = "Product or category not found"),
            @ApiResponse(responseCode = "409", description = "Another product already uses this name")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @Parameter(description = "Unique ID of the product to update", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(id, request)
        );
    }

    @Operation(
            summary = "Delete product",
            description = "Soft deletes an existing product using its unique ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN or MANAGER"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Unique ID of the product to delete", example = "1")
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }
}