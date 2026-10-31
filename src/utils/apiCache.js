const DEFAULT_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 200;

// url -> { data, cachedAt }
const responseCache = new Map();
// url -> Promise<Response>
const inFlight = new Map();

function buildInit(options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  return {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };
}

function isFresh(entry) {
  return entry && Date.now() - entry.cachedAt < DEFAULT_TTL_MS;
}

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export function clearApiCache() {
  responseCache.clear();
}

export function invalidateApiCache(url) {
  if (!url) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(url)) responseCache.delete(key);
  }
}

/**
 * Drop-in replacement for fetch() that caches successful GET responses
 * in memory and coalesces concurrent requests to the same URL. Mutating
 * requests pass straight through and clear the cache once they succeed.
 */
export async function cachedFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  if (method !== "GET") {
    const response = await fetch(url, buildInit(options));
    if (response.ok) responseCache.clear();
    return response;
  }

  const entry = responseCache.get(url);
  if (isFresh(entry)) return jsonResponse(entry.data);

  if (inFlight.has(url)) {
    const pending = await inFlight.get(url);
    return pending.clone();
  }

  const request = fetch(url, buildInit(options)).then(async (response) => {
    if (response.ok) {
      try {
        const data = await response.clone().json();
        if (!responseCache.has(url) && responseCache.size >= MAX_CACHE_ENTRIES) {
          responseCache.delete(responseCache.keys().next().value);
        }
        responseCache.set(url, { data, cachedAt: Date.now() });
      } catch {
        // Non-JSON responses simply skip the cache.
      }
    }
    return response;
  });

  const shared = request.then((response) => response.clone());
  inFlight.set(url, shared);
  shared.then(
    () => inFlight.delete(url),
    () => inFlight.delete(url)
  );

  return request;
}

/** Warm the cache for a URL that will likely be requested soon. */
export function prefetch(url, options = {}) {
  cachedFetch(url, options).catch(() => {
    // Prefetching is best-effort; the real request handles failures.
  });
}
