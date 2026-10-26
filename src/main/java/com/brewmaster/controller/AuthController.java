package com.brewmaster.controller;

import com.brewmaster.dto.request.LoginRequest;
import com.brewmaster.dto.request.RegisterRequest;
import com.brewmaster.dto.response.AuthenticationResponse;
import com.brewmaster.dto.response.UserResponse;
import com.brewmaster.service.interfaces.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "Authentication",
        description = "APIs for user registration and login"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @Operation(
            summary = "Register user",
            description = "Registers a new BrewMaster user account. "
                    + "New users are assigned the default BARISTA role."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User details: first name, last name, email, phone number "
                    + "and a password of 8 to 20 characters.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed, for example the email format is invalid"),
            @ApiResponse(responseCode = "409", description = "Email is already registered")
    })
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {

        UserResponse response = authenticationService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Operation(
            summary = "Login user",
            description = "Authenticates a user with email and password and returns a JWT access token. "
                    + "Use this token as a Bearer token to access the secured APIs."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Registered email and password.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful, JWT access token returned"),
            @ApiResponse(responseCode = "400", description = "Validation failed, for example the email is blank"),
            @ApiResponse(responseCode = "401", description = "Invalid email or password")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {

        AuthenticationResponse response =
                authenticationService.login(request);

        return ResponseEntity.ok(response);
    }
}