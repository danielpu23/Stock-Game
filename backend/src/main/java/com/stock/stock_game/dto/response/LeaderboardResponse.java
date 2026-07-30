package com.stock.stock_game.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaderboardResponse {

    /** 1-based position, assigned after sorting by total value. */
    private Integer rank;

    private String username;

    private BigDecimal cashBalance;

    private BigDecimal holdingsValue;

    private BigDecimal totalValue;

    /** Total value minus the game's starting cash — the player's profit or loss. */
    private BigDecimal profitLoss;
}
