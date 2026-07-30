package com.stock.stock_game.service;

import java.math.BigDecimal;

import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.stock.stock_game.dto.response.StockQuoteResponse;

/**
 * Live quotes from Finnhub. Instantiated by
 * {@link com.stock.stock_game.config.StockPriceConfig} only when an API key is
 * present, so the no-key case never reaches the network.
 */
public class FinnhubClient implements StockPriceProvider {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String apiKey;
    private final String apiUrl;

    public FinnhubClient(String apiKey, String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    @Override
    public BigDecimal fetchPrice(String symbol) {

        // Build the URL through UriComponentsBuilder so a symbol containing URL
        // metacharacters can't alter the query string.
        String url = UriComponentsBuilder.fromUriString(apiUrl)
                .path("/quote")
                .queryParam("symbol", symbol)
                .queryParam("token", apiKey)
                .toUriString();

        StockQuoteResponse quote;
        try {
            quote = restTemplate.getForObject(url, StockQuoteResponse.class);
        } catch (RestClientException e) {
            throw new StockPriceUnavailableException(
                    "Could not reach the price feed. Please try again.", e);
        }

        // Finnhub answers with c=0 for symbols it doesn't know, rather than a 404.
        if (quote == null
                || quote.getC() == null
                || quote.getC().signum() <= 0) {
            return null;
        }

        return quote.getC();
    }

    @Override
    public String describe() {
        return "Finnhub live quotes";
    }
}
