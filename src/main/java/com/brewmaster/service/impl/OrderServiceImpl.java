package com.brewmaster.service.impl;

import com.brewmaster.dto.request.CreateOrderRequest;
import com.brewmaster.dto.request.OrderItemRequest;
import com.brewmaster.dto.request.UpdateOrderStatusRequest;
import com.brewmaster.dto.response.OrderResponse;
import com.brewmaster.entity.Order;
import com.brewmaster.entity.OrderItem;
import com.brewmaster.entity.Product;
import com.brewmaster.enums.OrderStatus;
import com.brewmaster.exception.OrderNotFoundException;
import com.brewmaster.exception.ProductNotFoundException;
import com.brewmaster.mapper.OrderMapper;
import com.brewmaster.repository.OrderRepository;
import com.brewmaster.repository.ProductRepository;
import com.brewmaster.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {

        Order order = new Order();

        List<OrderItem> orderItems = new ArrayList<>();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new ProductNotFoundException("Product not found with ID: " + itemRequest.getProductId())
                    );

            if (Boolean.TRUE.equals(product.getDeleted())) {
                throw new ProductNotFoundException(
                        "Product is not available"
                );
            }

            if (!Boolean.TRUE.equals(product.getAvailable())) {
                throw new IllegalArgumentException(
                        "Product is currently unavailable: "
                                + product.getName()
                );
            }

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);

            totalAmount = totalAmount.add(subtotal);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findByDeletedFalse()
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found with ID: " + orderId)
                );

        if (Boolean.TRUE.equals(order.getDeleted())) {
            throw new OrderNotFoundException("Order not found with ID: " + orderId);
        }

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found with ID: " + orderId));

        if (Boolean.TRUE.equals(order.getDeleted())) {
            throw new OrderNotFoundException("Order not found with ID: " + orderId);
        }

        OrderStatus currentStatus = order.getStatus();
        OrderStatus requestedStatus = request.getStatus();

        if (currentStatus == OrderStatus.COMPLETED ||
                currentStatus == OrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Order status cannot be changed after completion or cancellation"
            );
        }

        if (currentStatus == OrderStatus.PENDING &&
                requestedStatus != OrderStatus.CONFIRMED &&
                requestedStatus != OrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Pending order can only be confirmed or cancelled"
            );
        }

        if (currentStatus == OrderStatus.CONFIRMED &&
                requestedStatus != OrderStatus.PREPARING &&
                requestedStatus != OrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Confirmed order can only be preparing or cancelled"
            );
        }

        if (currentStatus == OrderStatus.PREPARING &&
                requestedStatus != OrderStatus.READY &&
                requestedStatus != OrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Preparing order can only be ready or cancelled"
            );
        }

        if (currentStatus == OrderStatus.READY &&
                requestedStatus != OrderStatus.COMPLETED &&
                requestedStatus != OrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Ready order can only be completed or cancelled"
            );
        }

        order.setStatus(requestedStatus);

        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toOrderResponse(updatedOrder);
    }

    @Override
    public void deleteOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with ID: " + orderId
                        )
                );

        if (Boolean.TRUE.equals(order.getDeleted())) {
            throw new OrderNotFoundException(
                    "Order not found with ID: " + orderId
            );
        }

        order.setDeleted(true);

        orderRepository.save(order);
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {

        return orderRepository.findByStatusAndDeletedFalse(status)
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }
}