/**
 * Playwright global setup: warms up the Tolgee JVM auth code paths before
 * any test runs.
 *
 * The first request to `/v2/api-keys/current` triggers Spring class-loading
 * and JIT compilation, which can take 30+ seconds on a cold JVM. Running it
 * here ensures all tests start with a warm JVM and sub-second auth responses.
 */
const TOLGEE_URL = process.env.TOLGEE_URL ?? "http://localhost:8080";
const API_KEY = "examples-admin-imported-project-implicit";

async function warmupRequest(): Promise<boolean> {
  try {
    const res = await fetch(`${TOLGEE_URL}/v2/api-keys/current`, {
      headers: { "X-API-Key": API_KEY },
      signal: AbortSignal.timeout(90_000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

export default async function globalSetup(): Promise<void> {
  const startMs = Date.now();
  process.stdout.write("[global-setup] Warming up Tolgee auth...");

  for (let i = 0; i < 10; i++) {
    const ok = await warmupRequest();
    const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
    if (ok) {
      process.stdout.write(` done in ${elapsed}s\n`);
      return;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 2_000));
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  process.stdout.write(
    ` WARN: auth warmup failed after ${elapsed}s — tests may be slow\n`,
  );
}
