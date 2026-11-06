import "server-only";
import { createHash, randomBytes } from "crypto";
import { readJson, writeJson } from "./store";

/**
 * Daily funnel counters, kept in memory and flushed to data/stats.json every
 * few seconds. Unique visitors are counted with a hash of (ip, user agent, day,
 * random salt): the salt lives only in memory, so nothing identifying is stored.
 */

export interface DayStats {
  views: number;
  sessions: number;
  uniques: number;
  product: number;
  add: number;
  checkout: number;
  orders: number;
  revenue: number;
  sources: Record<string, number>;
  orderSources: Record<string, number>;
}

type Stats = Record<string, DayStats>;

const SALT = randomBytes(16).toString("hex");
const seen = new Map<string, Set<string>>();
let stats: Stats | null = null;
let loading: Promise<Stats> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function today(d = new Date()) {
  // Morocco is UTC+1 all year except during Ramadan; UTC+1 is close enough for daily buckets
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

function empty(): DayStats {
  return { views: 0, sessions: 0, uniques: 0, product: 0, add: 0, checkout: 0, orders: 0, revenue: 0, sources: {}, orderSources: {} };
}

async function load() {
  if (stats) return stats;
  loading ??= readJson<Stats>("stats.json", {}).then((s) => (stats = s));
  return loading;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    if (stats) writeJson("stats.json", stats).catch((e) => console.error("[stats]", e));
  }, 5000);
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|wget|python|node-fetch|go-http/i;

export function isBot(ua: string) {
  return !ua || BOT.test(ua);
}

export async function record(
  event: "view" | "product" | "add" | "checkout",
  opts: { ip: string; ua: string; source?: string; landing?: boolean },
) {
  const s = await load();
  const day = today();
  const d = (s[day] ??= empty());
  if (event === "view") {
    d.views++;
    const id = createHash("sha256").update(`${SALT}|${day}|${opts.ip}|${opts.ua}`).digest("hex").slice(0, 24);
    let set = seen.get(day);
    if (!set) {
      seen.clear();
      set = new Set();
      seen.set(day, set);
    }
    if (!set.has(id)) {
      set.add(id);
      d.uniques++;
    }
    if (opts.landing) {
      d.sessions++;
      const src = (opts.source || "direct").slice(0, 40);
      d.sources[src] = (d.sources[src] ?? 0) + 1;
    }
  } else {
    d[event]++;
  }
  scheduleFlush();
}

export async function recordOrder(total: number, source?: string) {
  const s = await load();
  const d = (s[today()] ??= empty());
  d.orders++;
  d.revenue += total;
  const src = (source || "direct").slice(0, 40);
  d.orderSources[src] = (d.orderSources[src] ?? 0) + 1;
  scheduleFlush();
}

export async function getStats() {
  return structuredClone(await load());
}
