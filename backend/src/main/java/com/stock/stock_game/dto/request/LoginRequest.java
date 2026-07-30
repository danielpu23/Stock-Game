package com.stock.stock_game.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "is required")
    private String username;

    @NotBlank(message = "is required")
    private String password;
}
