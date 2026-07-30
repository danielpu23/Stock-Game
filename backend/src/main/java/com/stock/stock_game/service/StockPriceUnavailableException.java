package com.stock.stock_game.service;

/**
 * The price feed itself failed (network error, rate limit, outage) — as opposed
 * to the caller asking for a symbol that doesn't exist.
 */
public class StockPriceUnavailableException extends RuntimeException {

    public StockPriceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
