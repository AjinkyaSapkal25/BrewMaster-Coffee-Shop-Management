package com.brewmaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Cashier Access",
        description = "Role-based access check API for the CASHIER role"
)
@RestController
@RequestMapping("/api/cashier")
public class CashierController {

    @Operation(
            summary = "Cashier access check",
            description = "Verifies that the authenticated user has the CASHIER role and returns a welcome message."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "The user has the CASHIER role"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not CASHIER")
    })
    @GetMapping
    public String cashierAccess() {
        return "Welcome Cashier! You have access to cashier operations.";
    }
}