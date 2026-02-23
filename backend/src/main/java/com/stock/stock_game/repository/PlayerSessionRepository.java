package com.stock.stock_game.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.stock.stock_game.model.entity.PlayerSession;

public interface PlayerSessionRepository extends JpaRepository<PlayerSession, Long> {
    
}
