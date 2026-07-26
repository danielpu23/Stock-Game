package com.stock.stock_game.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.stock.stock_game.exception.NotFoundException;
import com.stock.stock_game.model.entity.User;

@Service
public class CurrentUserService {

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new NotFoundException("User not authenticated");
        }

        return (User) authentication.getPrincipal();
    }

}