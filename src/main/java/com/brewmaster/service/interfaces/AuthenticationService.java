package com.brewmaster.service.interfaces;

import com.brewmaster.dto.request.LoginRequest;
import com.brewmaster.dto.request.RegisterRequest;
import com.brewmaster.dto.response.AuthenticationResponse;
import com.brewmaster.dto.response.UserResponse;

public interface AuthenticationService {

    UserResponse register(RegisterRequest request);

    AuthenticationResponse login(LoginRequest request);

}