import { parseWallClock, toLocalDateString } from "./dateTime.js";

// A seasonal baseline: each future day uses the mean of matching weekdays.
export function forecastDaily(events, { now = new Date(), lookback = 30, horizon = 7 } = {}) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(start.getDate() - lookback);
  const usable = events.map(({ date, value }) => ({ date: parseWallClock(date), value: Number(value) }))
    .filter((event) => event.date && event.date < today && Number.isFinite(event.value) && event.value >= 0);
  if (!usable.length) return null;
  const earliest = new Date(Math.min(...usable.map((event) => event.date.getTime())));
  earliest.setHours(0, 0, 0, 0);
  if (earliest > start) start.setTime(earliest.getTime());
  const totals = new Map();
  usable.filter((event) => event.date >= start).forEach((event) => {
    const key = toLocalDateString(event.date);
    totals.set(key, (totals.get(key) || 0) + event.value);
  });
  const weekdays = Array.from({ length: 7 }, () => []);
  let days = 0;
  for (const cursor = new Date(start); cursor < today; cursor.setDate(cursor.getDate() + 1)) {
    weekdays[cursor.getDay()].push(totals.get(toLocalDateString(cursor)) || 0);
    days++;
  }
  if (days < 14) return null;
  const points = Array.from({ length: horizon }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index + 1);
    const samples = weekdays[date.getDay()];
    const value = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
    return { date: toLocalDateString(date), value };
  });
  return { points, total: points.reduce((sum, point) => sum + point.value, 0), days,
    start: toLocalDateString(start), end: toLocalDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)) };
}
