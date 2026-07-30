package com.stock.stock_game.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.stock.stock_game.model.enums.SessionStatus;

import lombok.Getter;
import lombok.Setter;

/**
 * One row in "my games". Joining by invite code used to drop the player back on
 * the home page with no way to reach the game they had just joined; this backs
 * the list that fixes that.
 */
@Getter
@Setter
public class GameSummaryResponse {

    private Long id;

    private String name;

    private String inviteCode;

    private SessionStatus status;

    private Integer playerCount;

    private BigDecimal cashBalance;

    private LocalDateTime joinedAt;

    private boolean createdByMe;
}
