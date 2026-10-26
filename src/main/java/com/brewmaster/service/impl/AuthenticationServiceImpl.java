package com.brewmaster.service.impl;

import com.brewmaster.dto.request.LoginRequest;
import com.brewmaster.dto.request.RegisterRequest;
import com.brewmaster.dto.response.AuthenticationResponse;
import com.brewmaster.dto.response.UserResponse;
import com.brewmaster.entity.Role;
import com.brewmaster.entity.User;
import com.brewmaster.enums.RoleType;
import com.brewmaster.exception.EmailAlreadyExistsException;
import com.brewmaster.exception.InvalidCredentialsException;
import com.brewmaster.exception.RoleNotFoundException;
import com.brewmaster.mapper.UserMapper;
import com.brewmaster.repository.RoleRepository;
import com.brewmaster.repository.UserRepository;
import com.brewmaster.security.jwt.JwtService;
import com.brewmaster.service.interfaces.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;

    private final JwtService jwtService;

    @Override
    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered.");
        }

        Role role = roleRepository
                .findByRoleName(RoleType.ROLE_BARISTA)
                .orElseThrow(() ->
                        new RoleNotFoundException("Default role not found."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(role))
                .build();

        User savedUser = userRepository.save(user) ;

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    public AuthenticationResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMillis())
                .user(userMapper.toUserResponse(user))
                .build();
    }
}