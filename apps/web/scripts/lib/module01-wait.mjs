const DEFAULT_MAX_ATTEMPTS = 24;
const DEFAULT_INTERVAL_MS = 3000;

function normalizePositiveInteger(value, fallback) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

async function waitForCondition(input) {
  const maxAttempts = normalizePositiveInteger(input.maxAttempts, DEFAULT_MAX_ATTEMPTS);
  const intervalMs = normalizePositiveInteger(input.intervalMs, DEFAULT_INTERVAL_MS);
  let lastResult = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const pollResult = await input.poll(attempt);
    lastResult = pollResult;

    input.onAttempt?.(pollResult, attempt);

    if (input.isReady(pollResult)) {
      return {
        status: "pass",
        attempts: attempt,
        lastResult,
      };
    }

    if (!input.isWaiting(pollResult)) {
      return {
        status: "blocked",
        attempts: attempt,
        lastResult,
      };
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    status: "timeout",
    attempts: maxAttempts,
    lastResult,
  };
}

export { DEFAULT_INTERVAL_MS, DEFAULT_MAX_ATTEMPTS, normalizePositiveInteger, waitForCondition };
