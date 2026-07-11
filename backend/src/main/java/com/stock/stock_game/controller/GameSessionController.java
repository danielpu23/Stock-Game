package com.stock.stock_game.controller;

import com.stock.stock_game.dto.request.BuyStockRequest;
import com.stock.stock_game.dto.request.CreateGameRequest;
import com.stock.stock_game.dto.request.JoinGameRequest;
import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
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

    @GetMapping("/{id}")
    public GameResponse getGame(@PathVariable Long id) {
        return service.getGame(id);
    }

    @PostMapping("/{id}/start")
    public GameResponse startGame(@PathVariable Long id) {
        return service.startGame(id);
    }

    @GetMapping("/{id}/state")
    public GameStateResponse getGameState(@PathVariable Long id) {
        return service.getGameState(id);
    }

    @PostMapping("/{id}/buy")
    public String buyStock(
            @PathVariable Long id,
            @RequestBody BuyStockRequest request
    ) {
        service.buyStock(
                id,
                request.getUserId(),
                request.getSymbol(),
                request.getQuantity()
        );
        return "Stock purchased successfully";
    }
}