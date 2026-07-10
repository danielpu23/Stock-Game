package com.stock.stock_game.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinGameRequest {

    private Long userId;
    private String inviteCode;
}