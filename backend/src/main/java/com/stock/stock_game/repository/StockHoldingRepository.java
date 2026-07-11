package com.stock.stock_game.repository;


import com.stock.stock_game.model.entity.PlayerSession;
import com.stock.stock_game.model.entity.StockHolding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockHoldingRepository 
        extends JpaRepository<StockHolding, Long> {

    List<StockHolding> findByPlayerSession(
            PlayerSession playerSession
    );

    Optional<StockHolding> findByPlayerSessionAndSymbol(
            PlayerSession playerSession,
            String symbol
    );

}