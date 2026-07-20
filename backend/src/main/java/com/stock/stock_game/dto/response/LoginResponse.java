package com.stock.stock_game.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private Long id;

    private String username;

    public LoginResponse(
            Long id,
            String username
    ) {
        this.id = id;
        this.username = username;
    }
}