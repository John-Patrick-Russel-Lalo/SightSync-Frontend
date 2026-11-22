import { test } from "node:test";
import assert from "node:assert/strict";
import { forecastDaily } from "./forecast.js";

const now = new Date(2026, 10, 22, 12);
const options = { now, lookback: 30, horizon: 7 };

test("requires 14 complete days of history", () => {
  assert.equal(forecastDaily([], options), null);
  assert.equal(forecastDaily([{ date: "2026-11-15", value: 100 }], options), null);
});

test("uses matching weekdays and includes zero activity days", () => {
  const result = forecastDaily([{ date: "2026-11-08", value: 140 }], options);
  assert.equal(result.days, 14);
  assert.equal(result.points[0].date, "2026-11-23");
  assert.equal(result.points.at(-1).date, "2026-11-29");
  assert.equal(result.total, 70);
  assert.equal(result.points.at(-1).value, 70);
});

test("excludes today, future records, invalid values and old activity", () => {
  const events = [{ date: "2026-11-08", value: 140 }];
  const baseline = forecastDaily(events, options);
  const result = forecastDaily([...events,
    { date: "2026-11-22", value: 99999 },
    { date: "2026-11-23", value: 99999 },
    { date: "invalid", value: 100 },
    { date: "2026-11-09", value: -10 },
    { date: "2026-11-09", value: Infinity },
  ], options);
  assert.deepEqual(result, baseline);
});

test("honors horizon and historical window without negative projections", () => {
  const events = Array.from({ length: 90 }, (_, index) => {
    const date = new Date(2026, 10, 21 - index);
    return { date, value: index < 30 ? 10 : 1000 };
  });
  const result = forecastDaily(events, { ...options, horizon: 30 });
  assert.equal(result.days, 30);
  assert.equal(result.points.length, 30);
  assert.equal(result.total, 300);
  assert.ok(result.points.every((point) => point.value === 10));
});
