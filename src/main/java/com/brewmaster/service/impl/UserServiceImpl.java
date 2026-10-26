package com.brewmaster.service.impl;

import com.brewmaster.dto.request.UpdateUserRequest;
import com.brewmaster.dto.request.UpdateUserRoleRequest;
import com.brewmaster.dto.response.UserResponse;
import com.brewmaster.entity.Role;
import com.brewmaster.entity.User;
import com.brewmaster.enums.RoleType;
import com.brewmaster.exception.RoleNotFoundException;
import com.brewmaster.exception.UserNotFoundException;
import com.brewmaster.mapper.UserMapper;
import com.brewmaster.repository.RoleRepository;
import com.brewmaster.repository.UserRepository;
import com.brewmaster.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final UserMapper userMapper;

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Override
    public UserResponse updateUserRole(
            Long userId,
            UpdateUserRoleRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + userId));

        Role role = roleRepository
                .findByRoleName(request.getRole())
                .orElseThrow(() ->
                        new RoleNotFoundException("Role not found."));

        user.setRoles(new HashSet<>(Set.of(role)));;

        User updatedUser = userRepository.save(user);

        return userMapper.toUserResponse(updatedUser);
    }

    @Override
    public UserResponse getUserById(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse updateUser(
            Long userId,
            UpdateUserRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        return userMapper.toUserResponse(updatedUser);
    }

    @Override
    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + userId));

        userRepository.delete(user);
    }
}