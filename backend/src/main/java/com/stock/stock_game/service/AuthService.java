package com.stock.stock_game.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stock.stock_game.dto.request.LoginRequest;
import com.stock.stock_game.dto.request.RegisterRequest;
import com.stock.stock_game.dto.response.LoginResponse;
import com.stock.stock_game.dto.response.RegisterResponse;
import com.stock.stock_game.model.entity.User;
import com.stock.stock_game.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
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
            throw new RuntimeException("Invalid username or password");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new RuntimeException("Invalid username or password");
        }
        return new LoginResponse(
                user.getId(),
                user.getUsername()
        );
    }
}