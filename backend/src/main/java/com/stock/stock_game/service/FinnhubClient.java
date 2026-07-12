package com.stock.stock_game.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.stock.stock_game.dto.response.StockQuoteResponse;

@Service
public class FinnhubClient {

    private final RestTemplate restTemplate;

    @Value("${stock.api.key}")
    private String apiKey;

    @Value("${stock.api.url}")
    private String apiUrl;

    public FinnhubClient(){
        this.restTemplate = new RestTemplate();
    }

    public StockQuoteResponse getQuote(String symbol){
        String url =
                apiUrl
                + "/quote?symbol="
                + symbol
                + "&token="
                + apiKey;

        return restTemplate.getForObject(
                url,
                StockQuoteResponse.class
        );
    }
}