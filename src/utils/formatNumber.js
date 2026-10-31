const NUMBER_PATTERN = /^-?\d+$/;

/**
 * Formats whole-number report values with thousands separators (1,000).
 * Currency / percentage strings and already-formatted values pass through.
 */
export function formatCount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString("en-PH") : value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return NUMBER_PATTERN.test(trimmed)
      ? Number(trimmed).toLocaleString("en-PH")
      : value;
  }
  return value;
}
