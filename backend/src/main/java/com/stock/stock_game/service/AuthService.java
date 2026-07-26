package com.stock.stock_game.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stock.stock_game.dto.request.LoginRequest;
import com.stock.stock_game.dto.request.RegisterRequest;
import com.stock.stock_game.dto.response.LoginResponse;
import com.stock.stock_game.dto.response.RegisterResponse;
import com.stock.stock_game.exception.ConflictException;
import com.stock.stock_game.exception.UnauthorizedException;
import com.stock.stock_game.model.entity.User;
import com.stock.stock_game.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

       User savedUser = userRepository.save(user);

       return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
       );
    }
    
    public LoginResponse login(LoginRequest request) {
        Optional<User> optionalUser =
                userRepository.findByUsername(request.getUsername());

        if (optionalUser.isEmpty()) {
            throw new UnauthorizedException("Invalid username or password");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new UnauthorizedException("Invalid username or password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getUsername()
        );
    }
}