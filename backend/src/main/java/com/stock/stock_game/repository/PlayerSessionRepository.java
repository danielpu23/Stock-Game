package com.stock.stock_game.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.model.entity.PlayerSession;
import com.stock.stock_game.model.entity.User;

public interface PlayerSessionRepository extends JpaRepository<PlayerSession, Long> {
    boolean existsByUserAndGameSession(User user, GameSession gameSession);
    List<PlayerSession> findByGameSession(GameSession gameSession);
    Optional<PlayerSession> findByUserAndGameSession(
        User user,
        GameSession gameSession
    );
}
