package com.brewmaster.controller;

import com.brewmaster.dto.response.DashboardSummaryResponse;
import com.brewmaster.service.interfaces.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Dashboard",
        description = "APIs for BrewMaster business dashboard analytics. Available to ADMIN and MANAGER roles."
)
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(
            summary = "Get dashboard summary",
            description = "Retrieves summary statistics including total products, total orders, "
                    + "pending, completed and cancelled orders, and total sales from completed orders. "
                    + "Deleted products and orders are not counted. Total sales is 0 when there are no completed orders."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard summary retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN or MANAGER")
    })
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {

        return ResponseEntity.ok(
                dashboardService.getDashboardSummary()
        );
    }
}