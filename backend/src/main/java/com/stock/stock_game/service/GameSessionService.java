package com.stock.stock_game.service;

import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
import com.stock.stock_game.dto.response.HoldingResponse;
import com.stock.stock_game.dto.response.PlayerResponse;
import com.stock.stock_game.dto.response.PlayerStateResponse;
import com.stock.stock_game.model.entity.*;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final PlayerSessionRepository playerSessionRepository;
    private final UserRepository userRepository;
    private final StockHoldingRepository stockHoldingRepository;

    public GameSessionService(GameSessionRepository gameSessionRepository,
                              PlayerSessionRepository playerSessionRepository,
                              UserRepository userRepository,
                              StockHoldingRepository stockHoldingRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.playerSessionRepository = playerSessionRepository;
        this.userRepository = userRepository;
        this.stockHoldingRepository = stockHoldingRepository;
    }

    @Transactional
    public GameSession createGame(Long creatorUserId, String name, BigDecimal initialCash) {

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession game = new GameSession();
        game.setName(name);
        game.setInitialCash(initialCash);
        game.setStartDate(null);
        game.setEndDate(null);
        game.setStatus(SessionStatus.WAITING);
        game.setInviteCode(generateInviteCode());
        game.setCreatedBy(creator);
        gameSessionRepository.save(game);
        
        PlayerSession playerSession = new PlayerSession();
        playerSession.setUser(creator);
        playerSession.setGameSession(game);
        playerSession.setCashBalance(initialCash);

        playerSessionRepository.save(playerSession);
        return game;
    }

    public void joinGame(Long userId, String inviteCode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession game = gameSessionRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        
        if (playerSessionRepository.existsByUserAndGameSession(user, game)) {
            throw new RuntimeException("Already joined");
        }

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new RuntimeException("Game already started");
        }

        PlayerSession playerSession = new PlayerSession();
        playerSession.setUser(user);
        playerSession.setGameSession(game);
        playerSession.setCashBalance(game.getInitialCash());

        playerSessionRepository.save(playerSession);
    }

    // Simple invite code generator
    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }

        return code.toString();
    }

    public GameResponse getGame(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        List<PlayerSession> playerSessions =
                playerSessionRepository.findByGameSession(game);

        List<PlayerResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerResponse player = new PlayerResponse();
                    player.setUsername(
                        playerSession.getUser().getUsername()
                    );
                    player.setCashBalance(
                        playerSession.getCashBalance()
                    );
                    return player;
                })
                .collect(Collectors.toList());

        GameResponse response = new GameResponse();

        response.setId(game.getId());
        response.setName(game.getName());
        response.setInviteCode(game.getInviteCode());
        response.setStatus(game.getStatus());
        response.setPlayers(players);

        return response;
    }

    public GameResponse startGame(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new RuntimeException("Game already started");
        }

        game.setStatus(SessionStatus.IN_PROGRESS);
        game.setStartDate(LocalDateTime.now());

        gameSessionRepository.save(game);
        return getGame(game.getId());
    }

    public GameStateResponse getGameState(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        List<PlayerSession> playerSessions =
                playerSessionRepository.findByGameSession(game);

        List<PlayerStateResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerStateResponse player = new PlayerStateResponse();
                    player.setUsername(
                            playerSession.getUser().getUsername()
                    );
                    player.setCashBalance(
                            playerSession.getCashBalance()
                    );
                    /*
                    * Get player's stock holdings
                    */
                    List<StockHolding> holdings =
                            stockHoldingRepository.findByPlayerSession(playerSession);

                    List<HoldingResponse> holdingResponses =
                            holdings.stream()
                            .map(holding -> {
                                HoldingResponse response =
                                        new HoldingResponse();
                                response.setSymbol(
                                        holding.getSymbol()
                                );
                                response.setQuantity(
                                        holding.getQuantity()
                                );
                                response.setAveragePrice(
                                        holding.getAveragePrice()
                                );
                                return response;
                            })
                            .collect(Collectors.toList());

                    player.setHoldings(holdingResponses);


                    /*
                    * Temporary:
                    * portfolio value = cash only
                    *
                    * Later:
                    * cash + live stock prices
                    */
                    player.setPortfolioValue(
                            playerSession.getCashBalance()
                    );
                    return player;
                })
                .collect(Collectors.toList());

        GameStateResponse response = new GameStateResponse();
        response.setGameId(game.getId());
        response.setStatus(game.getStatus());
        response.setPlayers(players);
        return response;
    }
}