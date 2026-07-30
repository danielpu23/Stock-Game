package com.stock.stock_game.service;

import java.math.BigDecimal;

/**
 * Source of a current share price. Implementations are swapped at startup
 * depending on whether a Finnhub API key is configured.
 */
public interface StockPriceProvider {

    /**
     * @param symbol an already-normalised ticker (uppercase, validated)
     * @return the current price, or null if the symbol is unknown
     */
    BigDecimal fetchPrice(String symbol);

    /** Human-readable name, logged at startup so it's obvious which is active. */
    String describe();
}
