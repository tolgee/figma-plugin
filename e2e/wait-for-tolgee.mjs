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

async function main() {
  const started = Date.now();
  let attempt = 0;
  process.stdout.write(`Waiting for Tolgee at ${URL_TO_PROBE} `);
  while (Date.now() - started < TIMEOUT_MS) {
    attempt += 1;
    if (await probe()) {
      process.stdout.write(` OK (after ${attempt}s)\n`);
      return;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
  process.stdout.write(" FAIL\n");
  console.error(
    `Tolgee did not become reachable within ${TIMEOUT_MS / 1000}s. Aborting.`,
  );
  process.exit(1);
}

void main();
