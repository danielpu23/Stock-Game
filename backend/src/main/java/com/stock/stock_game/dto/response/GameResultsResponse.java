package com.stock.stock_game.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.stock.stock_game.model.enums.SessionStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameResultsResponse {

    private Long gameId;

    private String name;

    private SessionStatus status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String winner;

    private List<LeaderboardResponse> leaderboard;

}