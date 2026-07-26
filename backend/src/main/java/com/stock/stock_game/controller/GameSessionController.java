package com.stock.stock_game.controller;

import com.stock.stock_game.dto.request.BuyStockRequest;
import com.stock.stock_game.dto.request.CreateGameRequest;
import com.stock.stock_game.dto.request.JoinGameRequest;
import com.stock.stock_game.dto.request.SellStockRequest;
import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameResultsResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
import com.stock.stock_game.dto.response.LeaderboardResponse;
import com.stock.stock_game.dto.response.TransactionResponse;
import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.service.GameSessionService;
import com.stock.stock_game.service.CurrentUserService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
public class GameSessionController {

    private final GameSessionService service;
    private final CurrentUserService currentUserService;

    public GameSessionController(GameSessionService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public GameSession createGame(
            @Valid @RequestBody CreateGameRequest request){

        return service.createGame(
            currentUserService.getCurrentUser().getId(),
            request.getName(),
            request.getInitialCash()
        );
    }

    @PostMapping("/join")
    public String joinGame(
            @RequestBody JoinGameRequest request) {

        service.joinGame(
            currentUserService.getCurrentUser().getId(),
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
                currentUserService.getCurrentUser().getId(),
                request.getSymbol(),
                request.getQuantity()
        );
        return "Stock purchased successfully";
    }

    @GetMapping("/players/{playerSessionId}/transactions")
    public List<TransactionResponse> getTransactions(
            @PathVariable Long playerSessionId) {
        return service.getTransactions(playerSessionId);
    }

    @PostMapping("/{id}/sell")
    public String sellStock(
            @PathVariable Long id,
            @RequestBody SellStockRequest request) {

        service.sellStock(
                id,
                currentUserService.getCurrentUser().getId(),
                request.getSymbol(),
                request.getQuantity()
        );

        return "Stock sold successfully";
    }

    @GetMapping("/{id}/leaderboard")
    public List<LeaderboardResponse> getLeaderboard(
            @PathVariable Long id
    ) {
        return service.getLeaderboard(id);
    }

    @PostMapping("/{id}/finish")
    public GameResponse finishGame(@PathVariable Long id) {
        return service.finishGame(id);
    }

    @GetMapping("/{id}/results")
    public GameResultsResponse getGameResults(
            @PathVariable Long id) {
        return service.getGameResults(id);
    }
}