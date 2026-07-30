package com.stock.stock_game.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinGameRequest {

    @NotBlank(message = "is required")
    private String inviteCode;
}
