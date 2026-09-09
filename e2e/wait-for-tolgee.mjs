#!/usr/bin/env node
/**
 * Block until the Tolgee platform spun up by `e2e/docker-compose.yml`
 * answers an HTTP request with a non-5xx status.
 *
 * Tolgee's startup is slow (~30-60s cold) because it boots Spring Boot and
 * imports the seed data. The Docker healthcheck handles the same thing
 * inside `docker compose up --wait`, but `--wait` is unavailable on older
 * Docker engines, so this script doubles as a fallback usable from both
 * CI and local dev.
 *
 * Written as plain ESM JavaScript so it runs under stock `node` without
 * pulling `tsx`/`ts-node` into the toolchain.
 */
import http from "node:http";

const URL_TO_PROBE = process.env.TOLGEE_URL ?? "http://localhost:8080";
const TIMEOUT_MS = Number(process.env.TOLGEE_TIMEOUT_MS ?? 180_000);
const INTERVAL_MS = 1_000;
const API_KEY = "examples-admin-imported-project-implicit";

function probe() {
  return new Promise((resolve) => {
    const req = http.get(URL_TO_PROBE, { timeout: 2_000 }, (res) => {
      const status = res.statusCode ?? 0;
      res.resume();
      resolve(status > 0 && status < 500);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function warmupAuth() {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(URL_TO_PROBE).hostname,
      port: new URL(URL_TO_PROBE).port || 80,
      path: "/v2/api-keys/current",
      method: "GET",
      headers: { "X-API-Key": API_KEY },
      timeout: 60_000,
    };
    const req = http.request(options, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function main() {
  const started = Date.now();
  let attempt = 0;
  process.stdout.write(`Waiting for Tolgee at ${URL_TO_PROBE} `);
  while (Date.now() - started < TIMEOUT_MS) {
    attempt += 1;
    if (await probe()) {
      process.stdout.write(` OK (after ${attempt}s)\n`);
      break;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
    if (Date.now() - started >= TIMEOUT_MS) {
      process.stdout.write(" FAIL\n");
      console.error(
        `Tolgee did not become reachable within ${TIMEOUT_MS / 1000}s. Aborting.`,
      );
      process.exit(1);
    }
  }

  // Warm up the auth code path: the first request to /v2/api-keys/current
  // triggers JVM class-loading and JIT compilation which can take 30+ seconds.
  // Running it here (before tests start) ensures all tests see a warm JVM.
  process.stdout.write("Warming up auth endpoint ");
  const warmupStart = Date.now();
  let warmed = false;
  while (Date.now() - warmupStart < 120_000) {
    if (await warmupAuth()) {
      warmed = true;
      break;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 2_000));
  }
  if (warmed) {
    process.stdout.write(` OK\n`);
  } else {
    process.stdout.write(` WARN: auth warmup timed out, tests may be slow\n`);
  }
}

void main();
