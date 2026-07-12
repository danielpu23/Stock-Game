package com.stock.stock_game.controller;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.*;

import com.stock.stock_game.service.StockPriceService;

@RestController
@RequestMapping("/stocks")
public class StockController {

    private final StockPriceService stockPriceService;

    public StockController(
            StockPriceService stockPriceService
    ){
        this.stockPriceService = stockPriceService;
    }

    @GetMapping("/{symbol}")
    public BigDecimal getPrice(
            @PathVariable String symbol
    ){
        return stockPriceService.getPrice(symbol);
    }
}