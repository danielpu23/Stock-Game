package com.stock.stock_game.dto.response;

import java.util.List;

import com.stock.stock_game.model.enums.SessionStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameResponse {

    private Long id;

    private String name;

    private String inviteCode;

    private SessionStatus status;

    private List<PlayerResponse> players;
}