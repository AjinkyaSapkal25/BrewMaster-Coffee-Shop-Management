package com.brewmaster.service.interfaces;

import com.brewmaster.dto.request.CreateOrderRequest;
import com.brewmaster.dto.response.OrderResponse;
import com.brewmaster.dto.request.UpdateOrderStatusRequest;
import com.brewmaster.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    OrderResponse getOrderById(Long orderId);

    OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request);

    void deleteOrder(Long orderId);
}