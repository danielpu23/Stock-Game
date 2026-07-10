package com.stock.stock_game.controller;

import com.stock.stock_game.dto.CreateGameRequest;
import com.stock.stock_game.dto.JoinGameRequest;
import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.service.GameSessionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
public class GameSessionController {

    private final GameSessionService service;

    public GameSessionController(GameSessionService service) {
        this.service = service;
    }

    @PostMapping
    public GameSession createGame(
            @Valid @RequestBody CreateGameRequest request){

        return service.createGame(
            request.getUserId(),
            request.getName(),
            request.getInitialCash()
        );
    }

    @PostMapping("/join")
    public String joinGame(
            @RequestBody JoinGameRequest request) {

        service.joinGame(
            request.getUserId(),
            request.getInviteCode());

        return "Joined successfully";
    }
}