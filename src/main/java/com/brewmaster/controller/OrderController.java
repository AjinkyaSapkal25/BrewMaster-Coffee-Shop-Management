package com.brewmaster.controller;

import com.brewmaster.dto.request.CreateOrderRequest;
import com.brewmaster.dto.request.UpdateOrderStatusRequest;
import com.brewmaster.dto.response.OrderResponse;
import com.brewmaster.enums.OrderStatus;
import com.brewmaster.service.interfaces.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Orders",
        description = "APIs for managing BrewMaster customer orders"
)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @Operation(
            summary = "Create order",
            description = "Creates a new customer order containing one or more products."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "List of order items. Each item needs a product ID and a quantity of at least 1.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created successfully with its total amount calculated"),
            @ApiResponse(responseCode = "400", description = "Validation failed (for example no items or a quantity below 1), or a product is currently unavailable"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid"),
            @ApiResponse(responseCode = "404", description = "A product in the order was not found")
    })
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request
    ) {

        OrderResponse response = orderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @Operation(
            summary = "Get all orders",
            description = "Retrieves all active orders from the BrewMaster system."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }


    @Operation(
            summary = "Get order by ID",
            description = "Retrieves a single active order using its unique order ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "Unique ID of the order", example = "1")
            @PathVariable Long orderId
    ) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }


    @Operation(
            summary = "Update order status",
            description = "Updates the status of an existing order according to the allowed order workflow. "
                    + "The flow is PENDING, CONFIRMED, PREPARING, READY, COMPLETED. "
                    + "An order can be CANCELLED at any step before it is completed. "
                    + "Completed and cancelled orders cannot be changed."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "The new status for the order.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order status updated successfully"),
            @ApiResponse(responseCode = "400", description = "The status is missing or is not a valid order status"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "409", description = "This status change is not allowed by the order workflow")
    })
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "Unique ID of the order to update", example = "1")
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(orderId, request)
        );
    }


    @Operation(
            summary = "Delete order",
            description = "Soft deletes an existing order using its unique order ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Order deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN or MANAGER"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(
            @Parameter(description = "Unique ID of the order to delete", example = "1")
            @PathVariable Long orderId
    ) {

        orderService.deleteOrder(orderId);

        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "Get orders by status",
            description = "Retrieves all active orders having the specified order status."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully. The list is empty if no order has this status"),
            @ApiResponse(responseCode = "400", description = "The status is not a valid order status"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(
            @Parameter(description = "Order status: PENDING, CONFIRMED, PREPARING, READY, COMPLETED or CANCELLED", example = "PENDING")
            @PathVariable OrderStatus status) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }
}