package com.stock.stock_game.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private String token;

    private Long id;

    private String username;

    public LoginResponse(
            String token,
            Long id,
            String username
    ) {
        this.token = token;
        this.id = id;
        this.username = username;
    }
}