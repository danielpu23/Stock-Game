package com.stock.stock_game.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerStateResponse {
    private String username;

    private BigDecimal cashBalance;
    
    private BigDecimal portfolioValue;
}
