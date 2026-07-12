package com.stock.stock_game.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.stock.stock_game.model.enums.TransactionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionResponse {

    private Long id;

    private String symbol;

    private Integer quantity;

    private BigDecimal price;

    private TransactionType type;
    
    private LocalDateTime createdAt;
}