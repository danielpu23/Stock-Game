package com.stock.stock_game.controller;

import com.stock.stock_game.dto.request.BuyStockRequest;
import com.stock.stock_game.dto.request.CreateGameRequest;
import com.stock.stock_game.dto.request.JoinGameRequest;
import com.stock.stock_game.dto.request.SellStockRequest;
import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameResultsResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
import com.stock.stock_game.dto.response.GameSummaryResponse;
import com.stock.stock_game.dto.response.LeaderboardResponse;
import com.stock.stock_game.dto.response.MessageResponse;
import com.stock.stock_game.dto.response.TransactionResponse;
import com.stock.stock_game.service.CurrentUserService;
import com.stock.stock_game.service.GameSessionService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/games")
public class GameSessionController {

    private final GameSessionService service;
    private final CurrentUserService currentUserService;

    public GameSessionController(GameSessionService service,
                                CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public GameResponse createGame(
            @Valid @RequestBody CreateGameRequest request) {
        return service.createGame(
            currentUserService.getCurrentUser().getId(),
            request.getName(),
            request.getInitialCash()
        );
    }

    /** Returns the joined game so the client can navigate straight to its lobby. */
    @PostMapping("/join")
    public GameResponse joinGame(
            @Valid @RequestBody JoinGameRequest request) {
        return service.joinGame(
            currentUserService.getCurrentUser().getId(),
            request.getInviteCode());
    }

    /** Games the signed-in player has joined. */
    @GetMapping("/mine")
    public List<GameSummaryResponse> getMyGames() {
        return service.getMyGames(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}")
    public GameResponse getGame(@PathVariable Long id) {
        return service.getGame(id);
    }

    @PostMapping("/{id}/start")
    public GameResponse startGame(@PathVariable Long id) {
        return service.startGame(
                id,
                currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}/state")
    public GameStateResponse getGameState(@PathVariable Long id) {
        return service.getGameState(id);
    }

    @PostMapping("/{id}/buy")
    public MessageResponse buyStock(
            @PathVariable Long id,
            @Valid @RequestBody BuyStockRequest request
    ) {
        service.buyStock(
                id,
                currentUserService.getCurrentUser().getId(),
                request.getSymbol(),
                request.getQuantity()
        );
        return new MessageResponse("Stock purchased successfully");
    }

    @PostMapping("/{id}/sell")
    public MessageResponse sellStock(
            @PathVariable Long id,
            @Valid @RequestBody SellStockRequest request) {
        service.sellStock(
                id,
                currentUserService.getCurrentUser().getId(),
                request.getSymbol(),
                request.getQuantity()
        );
        return new MessageResponse("Stock sold successfully");
    }

    /**
     * The caller's own trades for this game. The previous route took a raw
     * playerSessionId and did no ownership check, so any signed-in user could read
     * any other player's trade history.
     */
    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> getMyTransactions(@PathVariable Long id) {
        return service.getMyTransactions(
                id,
                currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}/leaderboard")
    public List<LeaderboardResponse> getLeaderboard(@PathVariable Long id) {
        return service.getLeaderboard(id);
    }

    @PostMapping("/{id}/finish")
    public GameResponse finishGame(@PathVariable Long id) {
        return service.finishGame(
                id,
                currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}/results")
    public GameResultsResponse getGameResults(@PathVariable Long id) {
        return service.getGameResults(id);
    }
}
