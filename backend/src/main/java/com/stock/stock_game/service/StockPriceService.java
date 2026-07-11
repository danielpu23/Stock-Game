package com.stock.stock_game.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class StockPriceService {


    public BigDecimal getPrice(String symbol) {

        // temporary mock prices
        if(symbol.equals("AAPL")){
            return new BigDecimal("200");
        }

        if(symbol.equals("TSLA")){
            return new BigDecimal("300");
        }

        throw new RuntimeException("Unknown stock");
    }

}