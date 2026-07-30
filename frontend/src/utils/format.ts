const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "$12,345.67" — thousands separators, so six-figure portfolios stay readable. */
export function money(value: number): string {
  return CURRENCY.format(value ?? 0);
}

/** "+$120.50" / "-$120.50" — always carries an explicit sign for P/L columns. */
export function signedMoney(value: number): string {
  const amount = value ?? 0;
  return `${amount >= 0 ? "+" : "-"}${CURRENCY.format(Math.abs(amount))}`;
}

/** Tailwind-less helper for the up/down colour classes. */
export function directionClass(value: number): string {
  return (value ?? 0) >= 0 ? "up" : "down";
}
