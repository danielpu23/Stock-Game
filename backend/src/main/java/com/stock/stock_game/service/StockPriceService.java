package com.stock.stock_game.service;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import com.stock.stock_game.dto.response.StockQuoteResponse;

@Service
public class StockPriceService {

    private final FinnhubClient finnhubClient;

    public StockPriceService(
            FinnhubClient finnhubClient
    ){
        this.finnhubClient = finnhubClient;
    }

    public BigDecimal getPrice(String symbol){
        StockQuoteResponse response =
                finnhubClient.getQuote(symbol);

        if(response == null || response.getC() == null){
            throw new RuntimeException(
                    "Unable to get stock price"
            );
        }
        return response.getC();
    }
}