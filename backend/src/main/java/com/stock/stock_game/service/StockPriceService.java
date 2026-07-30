package com.stock.stock_game.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stock.stock_game.exception.BadRequestException;

@Service
public class StockPriceService {

    /** US tickers are 1-5 letters; anything else is a typo, not a stock. */
    private static final Pattern TICKER = Pattern.compile("^[A-Z]{1,5}$");

    private final StockPriceProvider provider;
    private final long cacheTtlMillis;

    /**
     * Valuing a portfolio prices every holding of every player, and the game page
     * polls every 5 seconds — without this cache a four-player game would exceed
     * Finnhub's 60 calls/minute on its own.
     */
    private final Map<String, CachedPrice> cache = new ConcurrentHashMap<>();

    public StockPriceService(
            StockPriceProvider provider,
            @Value("${stock.price.cache-ttl-seconds:15}") long cacheTtlSeconds
    ) {
        this.provider = provider;
        this.cacheTtlMillis = cacheTtlSeconds * 1000L;
    }

    public BigDecimal getPrice(String symbol) {

        String ticker = normalize(symbol);
        long now = System.currentTimeMillis();

        CachedPrice cached = cache.get(ticker);
        if (cached != null && now - cached.fetchedAt() < cacheTtlMillis) {
            return cached.price();
        }

        BigDecimal price = provider.fetchPrice(ticker);

        if (price == null || price.signum() <= 0) {
            throw new BadRequestException("Unknown ticker symbol: " + ticker);
        }

        cache.put(ticker, new CachedPrice(price, now));

        return price;
    }

    /** Uppercases and rejects anything that isn't ticker-shaped. */
    public String normalize(String symbol) {

        if (symbol == null || symbol.isBlank()) {
            throw new BadRequestException("A ticker symbol is required");
        }

        String ticker = symbol.trim().toUpperCase();

        if (!TICKER.matcher(ticker).matches()) {
            throw new BadRequestException(
                    "'" + symbol.trim() + "' is not a valid ticker symbol");
        }

        return ticker;
    }

    private record CachedPrice(BigDecimal price, long fetchedAt) {}
}
