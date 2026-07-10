package com.stock.stock_game.service;

import com.stock.stock_game.model.entity.*;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final PlayerSessionRepository playerSessionRepository;
    private final UserRepository userRepository;

    public GameSessionService(GameSessionRepository gameSessionRepository,
                              PlayerSessionRepository playerSessionRepository,
                              UserRepository userRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.playerSessionRepository = playerSessionRepository;
        this.userRepository = userRepository;
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
}