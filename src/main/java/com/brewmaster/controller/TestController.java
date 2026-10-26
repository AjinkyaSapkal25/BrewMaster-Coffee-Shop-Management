package com.brewmaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Test",
        description = "Utility API to verify JWT authentication"
)
@RestController
public class TestController {

    @Operation(
            summary = "Test JWT authentication",
            description = "Returns a success message when a valid JWT token is supplied. "
                    + "Useful for checking that authentication is working. Any logged-in role can call it."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JWT authentication is working"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid")
    })
    @GetMapping("/api/test")
    public String test() {
        return "JWT authentication is working!";
    }
}