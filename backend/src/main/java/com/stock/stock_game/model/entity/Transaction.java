package com.stock.stock_game.model.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name="transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="player_session_id", nullable=false)
    private PlayerSession playerSession;

    @Column(nullable=false)
    private String symbol;

    @Column(nullable=false)
    private String type;

    @Column(nullable=false)
    private Integer quantity;

    @Column(nullable=false, precision=15, scale=2)
    private BigDecimal price;

    @Column(nullable=false)
    private LocalDateTime createdAt;
}