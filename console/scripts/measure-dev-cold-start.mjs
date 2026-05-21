/**
 * Measure Vite dev-server cold start (clears node_modules/.vite first).
 *
 * Usage (from console/):
 *   node scripts/measure-dev-cold-start.mjs
 *   node scripts/measure-dev-cold-start.mjs --label optimized
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONSOLE_ROOT = join(__dirname, "..");
const PORT = Number(process.env.VITE_BENCH_PORT || 5174);
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const LABEL =
  process.argv.find((a) => a.startsWith("--label="))?.split("=")[1] ??
  process.env.BENCH_LABEL ??
  "run";

const PATHS = [
  { key: "index", path: "/" },
  { key: "main", path: "/src/main.tsx" },
  { key: "app", path: "/src/App.tsx" },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOk(url, timeoutMs) {
  const start = performance.now();
  const deadline = start + timeoutMs;
  let lastError = "timeout";
  while (performance.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return performance.now() - start;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await sleep(100);
  }
  throw new Error(`${url}: ${lastError}`);
}

function waitForReady(proc, timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let buf = "";
    const onData = (chunk) => {
      buf += chunk.toString();
      const match = buf.match(/ready in (\d+) ms/i);
      if (match) {
        cleanup();
        resolve({ readyMs: Number(match[1]), logReadyMs: performance.now() - start });
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Vite did not print 'ready' within timeout"));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      proc.stdout?.off("data", onData);
      proc.stderr?.off("data", onData);
    };
    proc.stdout?.on("data", onData);
    proc.stderr?.on("data", onData);
  });
}

async function waitForDepFile(timeoutMs) {
  const depPath = join(CONSOLE_ROOT, "node_modules", ".vite", "deps", "react.js");
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    if (existsSync(depPath)) return performance.now() - start;
    await sleep(100);
  }
  throw new Error("react.js dep bundle not created in time");
}

async function killProc(proc) {
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(proc.pid), "/f", "/t"], { shell: true });
  } else {
    proc.kill("SIGTERM");
  }
  await sleep(500);
}

async function freePort(port) {
  if (process.platform !== "win32") return;
  await new Promise((resolve) => {
    const killer = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `$p = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($p) { $p | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }`,
      ],
      { shell: false },
    );
    killer.on("close", () => resolve());
  });
  await sleep(1000);
}

async function runBenchmark() {
  await freePort(PORT);
  const viteCache = join(CONSOLE_ROOT, "node_modules", ".vite");
  await rm(viteCache, { recursive: true, force: true });
  if (existsSync(viteCache)) {
    throw new Error("Failed to clear node_modules/.vite");
  }

  const proc = spawn(
    "pnpm",
    ["exec", "vite", "--host", HOST, "--port", String(PORT), "--strictPort"],
    { cwd: CONSOLE_ROOT, shell: true, env: { ...process.env, FORCE_COLOR: "0" } },
  );

  const result = { label: LABEL, port: PORT };

  try {
    const ready = await waitForReady(proc, 300_000);
    result.viteReadyMs = ready.readyMs;
    result.viteReadyLogMs = Math.round(ready.logReadyMs);

    const fetchStart = performance.now();
    const fetchResults = await Promise.all(
      PATHS.map(async ({ key, path }) => {
        const ms = Math.round(await fetchOk(`${BASE}${path}`, 300_000));
        return { key, ms };
      }),
    );
    for (const { key, ms } of fetchResults) {
      result[`${key}Ms`] = ms;
    }
    result.parallelEntryMs = Math.round(performance.now() - fetchStart);

    result.depFileMs = Math.round(await waitForDepFile(300_000));
    result.reactDepMs = Math.round(
      await fetchOk(`${BASE}/node_modules/.vite/deps/react.js`, 60_000),
    );
  } finally {
    await killProc(proc);
  }

  return result;
}

const result = await runBenchmark();
console.log(JSON.stringify(result, null, 2));
