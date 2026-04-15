/** Local calendar buckets: today / yesterday / prev 3 days, then year-month (YYYY-MM). */

export type SessionFixedBucket = "today" | "yesterday" | "prev3";

export type SessionBucket =
  | { kind: "fixed"; id: SessionFixedBucket }
  | { kind: "month"; ym: string };

const FIXED_ORDER: SessionFixedBucket[] = ["today", "yesterday", "prev3"];

function startOfLocalDayMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole calendar days between the session's local date and today's local date (0 = same day). */
export function calendarDaysAgo(
  sessionMs: number,
  nowMs: number = Date.now(),
): number {
  const a = startOfLocalDayMs(sessionMs);
  const b = startOfLocalDayMs(nowMs);
  return Math.round((b - a) / 86400000);
}

function sessionLocalYearMonth(sessionMs: number): string {
  const d = new Date(sessionMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getSessionBucket(
  sessionMs: number,
  nowMs: number = Date.now(),
): SessionBucket {
  const days = calendarDaysAgo(sessionMs, nowMs);
  if (days <= 0) return { kind: "fixed", id: "today" };
  if (days === 1) return { kind: "fixed", id: "yesterday" };
  if (days >= 2 && days <= 4) return { kind: "fixed", id: "prev3" };
  return { kind: "month", ym: sessionLocalYearMonth(sessionMs) };
}

/** Stable map key for a bucket. */
export function sessionBucketKey(b: SessionBucket): string {
  if (b.kind === "fixed") return `f:${b.id}`;
  return `m:${b.ym}`;
}

export function parseSessionBucketKey(key: string): SessionBucket {
  if (key.startsWith("f:")) {
    return { kind: "fixed", id: key.slice(2) as SessionFixedBucket };
  }
  return { kind: "month", ym: key.slice(2) };
}

export function fixedBucketToI18nKey(id: SessionFixedBucket): string {
  switch (id) {
    case "today":
      return "chat.group.today";
    case "yesterday":
      return "chat.group.yesterday";
    case "prev3":
      return "chat.group.prev3Days";
    default:
      return "chat.group.today";
  }
}

/** Section title: i18n for fixed buckets, raw YYYY-MM for months. */
export function formatSessionGroupHeader(
  bucket: SessionBucket,
  t: (key: string) => string,
): string {
  if (bucket.kind === "month") return bucket.ym;
  return t(fixedBucketToI18nKey(bucket.id));
}

/** Non-empty fixed buckets first, then month keys newest-first (YYYY-MM sort desc). */
export function orderedSessionBucketKeys(keys: Set<string>): string[] {
  const months = [...keys]
    .filter((k) => k.startsWith("m:"))
    .map((k) => k.slice(2))
    .sort()
    .reverse()
    .map((ym) => `m:${ym}`);
  const out: string[] = [];
  for (const id of FIXED_ORDER) {
    const k = `f:${id}`;
    if (keys.has(k)) out.push(k);
  }
  out.push(...months);
  return out;
}
