package com.stock.stock_game.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "player_sessions", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_session_id"}))
public class PlayerSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal cashBalance;

    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();
}
