package com.brewmaster.service.impl;

import com.brewmaster.dto.request.CreateOrderRequest;
import com.brewmaster.dto.request.OrderItemRequest;
import com.brewmaster.dto.request.UpdateOrderStatusRequest;
import com.brewmaster.dto.response.OrderResponse;
import com.brewmaster.entity.Order;
import com.brewmaster.entity.Product;
import com.brewmaster.enums.OrderStatus;
import com.brewmaster.mapper.OrderMapper;
import com.brewmaster.repository.OrderRepository;
import com.brewmaster.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void createOrderCalculatesTotalAndStoresPriceSnapshot() {
        Product product = new Product();
        product.setId(11L);
        product.setName("Cappuccino");
        product.setPrice(new BigDecimal("150.00"));
        product.setAvailable(true);
        product.setDeleted(false);

        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(orderMapper.toOrderResponse(any(Order.class)))
                .thenAnswer(invocation -> {
                    Order order = invocation.getArgument(0);
                    return OrderResponse.builder()
                            .status(order.getStatus())
                            .totalAmount(order.getTotalAmount())
                            .build();
                });

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(11L);
        item.setQuantity(2);
        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of(item));

        OrderResponse response = orderService.createOrder(request);

        assertEquals(new BigDecimal("300.00"), response.getTotalAmount());
        assertEquals(OrderStatus.PENDING, response.getStatus());

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();
        assertEquals(new BigDecimal("300.00"), savedOrder.getTotalAmount());
        assertEquals(1, savedOrder.getItems().size());
        assertEquals(new BigDecimal("150.00"), savedOrder.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("300.00"), savedOrder.getItems().get(0).getSubtotal());
    }

    @Test
    void createOrderRejectsUnavailableProduct() {
        Product product = new Product();
        product.setId(11L);
        product.setName("Unavailable Coffee");
        product.setPrice(new BigDecimal("100.00"));
        product.setAvailable(false);
        product.setDeleted(false);
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(11L);
        item.setQuantity(1);
        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of(item));

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void updateOrderStatusRejectsInvalidTransition() {
        Order order = new Order();
        order.setId(5L);
        order.setDeleted(false);
        order.setStatus(OrderStatus.PENDING);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(OrderStatus.READY);

        assertThrows(IllegalStateException.class,
                () -> orderService.updateOrderStatus(5L, request));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
