package com.stock.stock_game.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Offline stand-in for Finnhub, used when no API key is configured.
 *
 * Prices are a pure function of (symbol, wall-clock time): every ticker gets a
 * stable base price derived from its name, then moves along three superimposed
 * sine waves — a slow trend, a medium swing, and fast jitter. That gives prices
 * that drift convincingly between polls without needing any stored state, and
 * that survive a backend restart without jumping.
 */
public class SimulatedPriceProvider implements StockPriceProvider {

    @Override
    public BigDecimal fetchPrice(String symbol) {

        long hash = stableHash(symbol);

        // Base price in the $20.00 - $500.00 range.
        double base = 20.0 + (hash % 48_000) / 100.0;

        double seconds = System.currentTimeMillis() / 1000.0;
        double phase = (hash % 1000) / 1000.0 * Math.PI * 2;

        double drift =
                0.060 * Math.sin(seconds / 900.0 + phase)
              + 0.020 * Math.sin(seconds / 120.0 + phase * 2)
              + 0.005 * Math.sin(seconds / 13.0 + phase * 3);

        return BigDecimal.valueOf(base * (1 + drift))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String describe() {
        return "simulated market (no STOCK_API_KEY configured)";
    }

    /**
     * String.hashCode() is stable across JVMs but can be negative; fold it into
     * a non-negative long so the price for a ticker never changes between runs.
     */
    private long stableHash(String symbol) {
        return Math.abs((long) symbol.hashCode()) + 1L;
    }
}
