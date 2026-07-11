package com.stock.stock_game.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class HoldingResponse {

    private String symbol;

    private Integer quantity;

    private BigDecimal averagePrice;

}