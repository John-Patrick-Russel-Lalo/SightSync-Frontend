/**
 * Appointment timestamps arrive from the API as timezone-less wall clock strings
 * ("2026-09-01 12:30:00"). They must be displayed exactly as stored.
 *
 * Passing such a value straight to `new Date()` lets the browser guess a timezone
 * (UTC when the string is ISO-8601), which shifts the appointment by the
 * viewer's UTC offset. `parseWallClock` reads the calendar and clock digits
 * directly and builds a local `Date`, so `12:30` always renders as 12:30.
 */

const WALL_CLOCK_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

const EN_US = "en-US";

/**
 * Parses an API date value into a local `Date` built from its wall clock digits.
 * Any trailing offset ("Z", "+08:00") is ignored so the displayed value always
 * matches what was stored.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {Date | null}
 */
export function parseWallClock(value) {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const match = WALL_CLOCK_PATTERN.exec(String(value).trim());
  if (!match) return null;

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

/**
 * Local `YYYY-MM-DD` for a `Date`. Use this instead of `toISOString().split("T")[0]`,
 * which returns the UTC date and can be a day behind.
 *
 * @param {Date} date
 * @returns {string}
 */
export function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Local `YYYY-MM-DD` for any API date value (wall clock string, ISO string or Date).
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
export function toLocalDateStringFromValue(value) {
  const parsed = parseWallClock(value);
  if (!parsed) return "";
  return toLocalDateString(parsed);
}

/**
 * Local `YYYY-MM-DD HH:MM:SS` for any API date value, suitable for grouping and
 * comparisons without timezone drift.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
export function toLocalDateTimeString(value) {
  const parsed = parseWallClock(value);
  if (!parsed) return "";

  const time = [parsed.getHours(), parsed.getMinutes(), parsed.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return `${toLocalDateString(parsed)} ${time}`;
}

/**
 * Time of day for an API date value, e.g. "12:30 PM".
 *
 * @param {string | number | Date | null | undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string} "N/A" when the value cannot be parsed.
 */
export function formatWallClockTime(value, options) {
  const parsed = parseWallClock(value);
  if (!parsed) return "N/A";

  return parsed.toLocaleTimeString(EN_US, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

/**
 * Date only for an API date value, e.g. "Mon, Sep 1, 2026".
 *
 * @param {string | number | Date | null | undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string} "N/A" when the value cannot be parsed.
 */
export function formatWallClockDate(value, options) {
  const parsed = parseWallClock(value);
  if (!parsed) return "N/A";

  return parsed.toLocaleDateString(EN_US, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

/**
 * Date and time for an API date value, e.g. "Mon, Sep 1, 2026 • 12:30 PM".
 * Values without a time component render as the date alone.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
export function formatWallClockDateTime(value) {
  if (value === null || value === undefined || value === "") return "N/A";

  const parsed = parseWallClock(value);
  if (!parsed) return String(value);

  const formattedDate = formatWallClockDate(parsed);

  const hasTime = /\d{1,2}:\d{2}/.test(String(value));
  if (!hasTime) return formattedDate;

  return `${formattedDate} • ${formatWallClockTime(parsed)}`;
}

/**
 * Epoch milliseconds for an API date value, or `NaN` when unparseable.
 * Use for sorting and range checks instead of `new Date(value).getTime()`.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {number}
 */
export function wallClockTimeMs(value) {
  const parsed = parseWallClock(value);
  return parsed ? parsed.getTime() : Number.NaN;
}