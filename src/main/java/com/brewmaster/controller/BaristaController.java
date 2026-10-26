package com.brewmaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Barista Access",
        description = "Role-based access check API for the BARISTA role"
)
@RestController
@RequestMapping("/api/barista")
public class BaristaController {

    @Operation(
            summary = "Barista access check",
            description = "Verifies that the authenticated user has the BARISTA role and returns a welcome message."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "The user has the BARISTA role"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not BARISTA")
    })
    @GetMapping
    public String baristaAccess() {
        return "Welcome Barista! You have access to barista operations.";
    }
}