import { directionClass, money } from "../utils/format";

interface StockChartProps {
  symbol: string;
  price: number;
  /** Prices observed this session, oldest first. */
  history: number[];
}

/* Drawn in an arbitrary coordinate space and scaled to the container by the
   viewBox, so the sparkline fits whatever width the trade panel has. */
const VIEW_W = 300;
const VIEW_H = 40;

/**
 * A sparkline of the quotes seen since this ticker was typed.
 *
 * The previous version drew a bar from a `previousPrice` prop that no caller
 * ever passed, so it permanently displayed +0.00 (0.00%).
 */
export default function StockChart({ symbol, price, history }: StockChartProps) {
  const first = history[0] ?? price;
  const change = price - first;
  const changePercent = first === 0 ? 0 : (change / first) * 100;
  const direction = directionClass(change);
  const hasTrend = history.length > 1;

  return (
    <div className="trade__quote">
      <div className="trade__quote-top">
        <span className="ticker">{symbol}</span>
        <span className="trade__quote-price">{money(price)}</span>
      </div>

      {hasTrend && (
        <>
          <svg
            className="trade__spark"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            aria-label={`${symbol} price trend`}
            role="img"
          >
            <polyline
              points={toPoints(history)}
              fill="none"
              stroke={`var(--${direction})`}
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className={`trade__quote-change ${direction}`}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)} ({change >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}%) · {history.length} ticks
          </div>
        </>
      )}
    </div>
  );
}

/** Maps the series onto the viewBox, padded so a flat line still sits mid-height. */
function toPoints(history: number[]): string {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = max - min || 1;
  const step = VIEW_W / Math.max(history.length - 1, 1);
  const padding = 4;
  const usable = VIEW_H - padding * 2;

  return history
    .map((value, index) => {
      const x = index * step;
      const y = padding + usable - ((value - min) / span) * usable;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
