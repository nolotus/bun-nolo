// packages/server/devReload.ts
//
// - /dev-reload SSE
// - esbuild 在 dev 构建成功后写 public/.dev-reload-version（JSON {version,builtAt,buildMs}）
// - server 用 fs.watch 监听变化，变化即广播 reload（快）
// - 用轮询做兜底（稳）
// - SSE 连接建立时做版本对账（cv != sv 立刻 reload）
// - SSE 设置 retry: 200，断线后更快重连（降低 buildToEventMs）

import { isProduction } from "utils/env";
import { readFileSync, watch } from "node:fs";

export const ENABLE_LIVE_RELOAD =
  !isProduction ||
  (typeof process !== "undefined" && process.env.ENABLE_LIVE_RELOAD === "1");

const encoder = new TextEncoder();
const enc = (s: string) => encoder.encode(s);

const PUBLIC_DIR = "public";
const FILE_NAME = ".dev-reload-version";
const FILE_PATH = `${PUBLIC_DIR}/${FILE_NAME}`;

type BuildInfo = {
  version: string;
  builtAt: number;
  buildMs?: number;
};

const clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();

// background
let fsWatcher: ReturnType<typeof watch> | null = null;
let pollTimer: Timer | null = null;
let keepAliveTimer: Timer | null = null;

let lastVersion: string | null = null;

const readBuildInfo = (): BuildInfo | null => {
  try {
    const raw = readFileSync(FILE_PATH, "utf8").trim();
    if (!raw) return null;

    // 兼容旧格式：纯字符串时间戳
    if (!raw.startsWith("{")) {
      const builtAt = Number(raw) || Date.now();
      return { version: String(raw), builtAt };
    }

    const obj = JSON.parse(raw);
    if (
      !obj ||
      typeof obj.version !== "string" ||
      typeof obj.builtAt !== "number"
    ) {
      return null;
    }
    if (typeof obj.buildMs !== "number") delete obj.buildMs;
    return obj as BuildInfo;
  } catch {
    return null;
  }
};

const broadcastReload = (info: BuildInfo, reason: string) => {
  const payload =
    `event: reload\n` + `data: ${JSON.stringify({ ...info, reason })}\n\n`;

  for (const writer of clients) {
    writer.write(enc(payload)).catch(() => {
      clients.delete(writer);
      try {
        writer.close();
      } catch {}
    });
  }
};

const handleMaybeChanged = (reason: string) => {
  const info = readBuildInfo();
  if (!info) return;

  if (info.version !== lastVersion) {
    lastVersion = info.version;
    console.log("🔁 dev-reload changed:", info, "reason:", reason);
    broadcastReload(info, reason);
  }
};

const startBackgroundIfNeeded = () => {
  if (fsWatcher || pollTimer || keepAliveTimer) return;

  lastVersion = readBuildInfo()?.version ?? null;

  fsWatcher = watch(PUBLIC_DIR, (eventType, filename) => {
    if (!filename || filename === FILE_NAME) {
      handleMaybeChanged(`fs.watch:${eventType}`);
    }
  });

  pollTimer = setInterval(() => handleMaybeChanged("poll"), 1000);

  keepAliveTimer = setInterval(() => {
    const ping = enc(`: ping\n\n`);
    for (const writer of clients) {
      writer.write(ping).catch(() => {
        clients.delete(writer);
        try {
          writer.close();
        } catch {}
      });
    }
  }, 15_000);
};

const stopBackgroundIfIdle = () => {
  if (clients.size > 0) return;

  if (fsWatcher) {
    try {
      fsWatcher.close();
    } catch {}
    fsWatcher = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};

const createSseResponse = (
  req: Request,
  onStart: (writer: WritableStreamDefaultWriter<Uint8Array>) => void
) => {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // 关键：让浏览器断线后更快重连（默认可能是几秒）
  writer.write(enc(`retry: 200\n`)).catch(() => {});

  // 让浏览器尽快认为连接建立
  writer.write(enc(`: connected\n\n`)).catch(() => {});

  onStart(writer);

  // 客户端断开时尽量关掉 writer
  req.signal.addEventListener("abort", () => {
    try {
      writer.close();
    } catch {}
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

export const devReloadRoute = (req: Request) => {
  if (!ENABLE_LIVE_RELOAD)
    return new Response("live reload disabled", { status: 404 });

  const url = new URL(req.url);
  const clientVersion = url.searchParams.get("cv") || "";

  return createSseResponse(req, (writer) => {
    clients.add(writer);
    startBackgroundIfNeeded();

    // 连接对账：客户端落后就立刻补 reload（根治 server 重启错过边沿）
    const info = readBuildInfo();
    if (info?.version && clientVersion && info.version !== clientVersion) {
      const payload =
        `event: reload\n` +
        `data: ${JSON.stringify({ ...info, reason: "mismatch" })}\n\n`;
      writer.write(enc(payload)).catch(() => {});
    }

    req.signal.addEventListener("abort", () => {
      clients.delete(writer);
      stopBackgroundIfIdle();
    });
  });
};
