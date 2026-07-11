package com.stock.stock_game.dto.response;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;


@Getter
@Setter
public class PlayerStateResponse {

    private String username;

    private BigDecimal cashBalance;

    private BigDecimal portfolioValue;

    private List<HoldingResponse> holdings;

}