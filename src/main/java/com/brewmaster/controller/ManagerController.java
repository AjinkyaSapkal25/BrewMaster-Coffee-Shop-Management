package com.brewmaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Manager Access",
        description = "Role-based access check API for the MANAGER role"
)
@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Operation(
            summary = "Manager access check",
            description = "Verifies that the authenticated user has the MANAGER role and returns a welcome message."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "The user has the MANAGER role"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not MANAGER")
    })
    @GetMapping
    public String managerAccess() {
        return "Welcome Manager! You have access to manager operations.";
    }
}