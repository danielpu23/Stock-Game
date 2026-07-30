package com.stock.stock_game.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.stock.stock_game.exception.UnauthorizedException;
import com.stock.stock_game.model.entity.User;

@Service
public class CurrentUserService {

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // An anonymous request still carries a non-null Authentication whose
        // principal is the string "anonymousUser", so a bare null check isn't
        // enough — the cast would then fail with a ClassCastException and a 500.
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Not authenticated");
        }

        return user;
    }
}
