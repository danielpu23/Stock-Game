import { useEffect, useState } from "react";

/**
 * Delays reacting to a fast-changing value.
 *
 * The ticker inputs fired a quote request on every keystroke, so typing "AAPL"
 * cost four calls and a fast typist could exhaust Finnhub's 60-per-minute free
 * tier on their own.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
