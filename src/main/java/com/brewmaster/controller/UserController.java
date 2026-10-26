package com.brewmaster.controller;

import com.brewmaster.dto.request.UpdateUserRequest;
import com.brewmaster.dto.request.UpdateUserRoleRequest;
import com.brewmaster.dto.response.UserResponse;
import com.brewmaster.service.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Users",
        description = "APIs for managing BrewMaster users. All of these APIs are for the ADMIN role only."
)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @Operation(
            summary = "Get all users",
            description = "Retrieves all users registered in the BrewMaster system."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN")
    })
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }


    @Operation(
            summary = "Update user role",
            description = "Updates the role assigned to an existing BrewMaster user. "
                    + "The user's previous role is replaced by the new one."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "The new role: ROLE_ADMIN, ROLE_MANAGER, ROLE_CASHIER or ROLE_BARISTA.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User role updated successfully"),
            @ApiResponse(responseCode = "400", description = "The role is missing or is not a valid role"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User or role not found")
    })
    @PutMapping("/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @Parameter(description = "Unique ID of the user whose role will change", example = "1")
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        return ResponseEntity.ok(
                userService.updateUserRole(userId, request)
        );
    }


    @Operation(
            summary = "Get user by ID",
            description = "Retrieves a single user using their unique user ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "Unique ID of the user", example = "1")
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                userService.getUserById(userId)
        );
    }


    @Operation(
            summary = "Update user",
            description = "Updates the first name, last name and phone number of an existing BrewMaster user. "
                    + "The email and role are not changed by this API."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "New first name, last name and a valid 10-digit Indian mobile number.",
            required = true
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed, for example the phone number is not a valid 10-digit mobile number"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "Unique ID of the user to update", example = "1")
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                userService.updateUser(userId, request)
        );
    }


    @Operation(
            summary = "Delete user",
            description = "Permanently deletes an existing user using their unique user ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied. Token is missing or invalid, or the role is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "Unique ID of the user to delete", example = "1")
            @PathVariable Long userId) {

        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }
}