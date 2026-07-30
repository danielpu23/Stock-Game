import { useEffect, useRef, useState } from "react";

import { getStockPrice } from "../api/stockApi";
import { useDebouncedValue } from "./useDebouncedValue";

/** How often to re-poll the quote for the symbol currently being typed. */
const REFRESH_MS = 5000;

const TICKER = /^[A-Z]{1,5}$/;

export interface StockQuote {
  symbol: string;
  price: number | null;
  /** Prices seen this session, oldest first — drives the sparkline. */
  history: number[];
  loading: boolean;
  error: string | null;
}

interface FetchedQuote {
  symbol: string;
  price: number | null;
  history: number[];
  error: string | null;
}

const EMPTY: StockQuote = {
  symbol: "",
  price: null,
  history: [],
  loading: false,
  error: null,
};

/**
 * Looks up the current price for whatever the user has typed, debounced, and
 * keeps refreshing it so the displayed quote doesn't go stale while they decide.
 *
 * Only the fetched result is held in state — the empty, invalid, and loading
 * cases are derived during render, so the effect never sets state synchronously.
 */
export function useStockQuote(symbol: string): StockQuote {
  const debouncedSymbol = useDebouncedValue(symbol.trim().toUpperCase());
  const isTicker = TICKER.test(debouncedSymbol);

  const [fetched, setFetched] = useState<FetchedQuote | null>(null);

  // Held in a ref so a new sample doesn't restart the polling effect.
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    // Don't ask the server about things that can't be tickers.
    if (!isTicker) {
      return;
    }

    let active = true;
    historyRef.current = [];

    async function poll() {
      try {
        const price = await getStockPrice(debouncedSymbol);

        // A slow response for a previous symbol must not overwrite a newer one.
        if (!active) return;

        // Quotes are cached server-side for longer than this poll interval, so
        // consecutive requests often return the identical price. Recording those
        // would draw a staircase instead of a trend.
        const previous = historyRef.current[historyRef.current.length - 1];
        if (previous !== price) {
          historyRef.current = [...historyRef.current, price].slice(-40);
        }

        setFetched({
          symbol: debouncedSymbol,
          price,
          history: historyRef.current,
          error: null,
        });
      } catch {
        if (!active) return;
        setFetched({
          symbol: debouncedSymbol,
          price: null,
          history: [],
          error: "No quote available",
        });
      }
    }

    poll();
    const interval = setInterval(poll, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [debouncedSymbol, isTicker]);

  if (debouncedSymbol === "") {
    return EMPTY;
  }

  if (!isTicker) {
    return { ...EMPTY, symbol: debouncedSymbol, error: "Not a valid ticker" };
  }

  // Still waiting on the first response for this symbol.
  if (fetched === null || fetched.symbol !== debouncedSymbol) {
    return { ...EMPTY, symbol: debouncedSymbol, loading: true };
  }

  return { ...fetched, loading: false };
}
