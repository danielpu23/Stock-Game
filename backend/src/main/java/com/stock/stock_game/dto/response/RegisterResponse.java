package com.stock.stock_game.dto.response;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class RegisterResponse {

    private Long id;

    private String username;

    private String email;

    public RegisterResponse(
            Long id,
            String username,
            String email
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
}