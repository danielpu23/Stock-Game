export function isMarketHours(): boolean {
  const now = new Date();

  // Convert to EST
  const easternTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const day = easternTime.getDay();
  const hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();

  // Check if it's a weekday
  if (day < 1 || day > 5) {
    return false;
  }

  // Check if time is between 9:30 AM and 4:00 PM (market hours)
  const currentTime = hours + minutes / 60;
  return currentTime >= 9.5 && currentTime < 16.0;
}

// find next open market time
export function getNextMarketOpen(): Date {
  const now = new Date();
  const easternTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const day = easternTime.getDay();
  const hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();
  const currentTime = hours + minutes / 60;

  let nextOpen = new Date(easternTime);
  nextOpen.setHours(9, 30, 0, 0);

  if (currentTime >= 9.5 && currentTime < 16.0) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  } else if (currentTime >= 16.0) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }

  const nextDay = nextOpen.getDay();
  if (nextDay === 0) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  } else if (nextDay === 6) {
    nextOpen.setDate(nextOpen.getDate() + 2);
  }

  return nextOpen;
}

export function getMarketStatusMessage(): string {
  if (isMarketHours()) {
    return "Market is currently open. Trading is available.";
  }

  const nextOpen = getNextMarketOpen();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  };

  return `Market is currently closed. Next market open: ${nextOpen.toLocaleString("en-US", options)}`;
}
