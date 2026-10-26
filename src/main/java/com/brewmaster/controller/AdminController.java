package com.brewmaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Admin Access",
        description = "Role-based access check API for the ADMIN role"
)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Operation(
            summary = "Admin access check",
            description = "Verifies that the authenticated user has the ADMIN role and returns a welcome message."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "The user has the ADMIN role"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN")
    })
    @GetMapping
    public String adminAccess() {
        return "Welcome Admin! You have access to admin operations.";
    }
}