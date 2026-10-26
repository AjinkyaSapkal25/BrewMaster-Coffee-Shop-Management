package com.brewmaster.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DashboardSummaryResponse {

    private long totalProducts;

    private long totalOrders;

    private long pendingOrders;

    private long completedOrders;

    private long cancelledOrders;

    private BigDecimal totalSales;
}