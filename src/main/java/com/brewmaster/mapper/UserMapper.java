package com.brewmaster.mapper;

import com.brewmaster.dto.response.UserResponse;
import com.brewmaster.entity.Role;
import com.brewmaster.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {

        Set<String> roles = user.getRoles()
                .stream()
                .map(Role::getRoleName)
                .map(Enum::name)
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(roles)
                .build();
    }
}