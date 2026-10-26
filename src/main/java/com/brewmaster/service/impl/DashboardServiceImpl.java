package com.brewmaster.service.impl;

import com.brewmaster.dto.response.DashboardSummaryResponse;
import com.brewmaster.enums.OrderStatus;
import com.brewmaster.repository.OrderRepository;
import com.brewmaster.repository.ProductRepository;
import com.brewmaster.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {

        DashboardSummaryResponse response = new DashboardSummaryResponse();

        long totalProducts = productRepository.countByDeletedFalse();

        long totalOrders = orderRepository.countByDeletedFalse();

        long pendingOrders =
                orderRepository.countByStatusAndDeletedFalse(OrderStatus.PENDING);

        long completedOrders =
                orderRepository.countByStatusAndDeletedFalse(OrderStatus.COMPLETED);

        long cancelledOrders =
                orderRepository.countByStatusAndDeletedFalse(OrderStatus.CANCELLED);

        BigDecimal totalSales =
                orderRepository.sumTotalAmountByStatusAndDeletedFalse(OrderStatus.COMPLETED);

        response.setTotalProducts(totalProducts);
        response.setTotalOrders(totalOrders);
        response.setPendingOrders(pendingOrders);
        response.setCompletedOrders(completedOrders);
        response.setCancelledOrders(cancelledOrders);
        response.setTotalSales(totalSales);

        return response;
    }
}