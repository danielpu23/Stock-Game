package com.stock.stock_game.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BuyStockRequest {

    private Long userId;

    private String symbol;

    private Integer quantity;

}