package com.brewmaster.service.interfaces;

import com.brewmaster.dto.request.UpdateUserRequest;
import com.brewmaster.dto.request.UpdateUserRoleRequest;
import com.brewmaster.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse updateUserRole(Long userId, UpdateUserRoleRequest request);

    UserResponse getUserById(Long userId);

    UserResponse updateUser(Long userId, UpdateUserRequest request);

    void deleteUser(Long userId);
}