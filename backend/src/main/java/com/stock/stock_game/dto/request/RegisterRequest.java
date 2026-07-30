package com.stock.stock_game.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "is required")
    @Size(min = 3, max = 50, message = "must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "is required")
    @Email(message = "must be a valid email address")
    private String email;

    @NotBlank(message = "is required")
    @Size(min = 8, max = 100, message = "must be at least 8 characters")
    private String password;
}
