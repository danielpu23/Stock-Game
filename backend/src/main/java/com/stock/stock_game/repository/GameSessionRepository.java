package com.stock.stock_game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.stock.stock_game.model.entity.GameSession;

public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
}
