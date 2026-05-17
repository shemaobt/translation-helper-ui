export interface Bucket<T> {
  label: string;
  items: T[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function groupByBucket<T extends { lastMessageAt: Date }>(items: T[]): Bucket<T>[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - DAY_MS;
  const startOfWeek = startOfToday - 7 * DAY_MS;
  const startOfMonth = startOfToday - 30 * DAY_MS;

  const today: T[] = [];
  const yesterday: T[] = [];
  const week: T[] = [];
  const month: T[] = [];
  const older: T[] = [];

  const sorted = [...items].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  for (const it of sorted) {
    const t = it.lastMessageAt.getTime();
    if (t >= startOfToday) today.push(it);
    else if (t >= startOfYesterday) yesterday.push(it);
    else if (t >= startOfWeek) week.push(it);
    else if (t >= startOfMonth) month.push(it);
    else older.push(it);
  }

  return [
    { label: 'today', items: today },
    { label: 'yesterday', items: yesterday },
    { label: 'earlierThisWeek', items: week },
    { label: 'lastWeek', items: month },
    { label: 'earlier', items: older },
  ].filter((b) => b.items.length > 0);
}

const relTimeCache = new Map<string, Intl.RelativeTimeFormat>();
const monthDayCache = new Map<string, Intl.DateTimeFormat>();

function relTimeFor(locale?: string): Intl.RelativeTimeFormat {
  const key = locale ?? 'default';
  let fmt = relTimeCache.get(key);
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    relTimeCache.set(key, fmt);
  }
  return fmt;
}

function monthDayFor(locale?: string): Intl.DateTimeFormat {
  const key = locale ?? 'default';
  let fmt = monthDayCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
    monthDayCache.set(key, fmt);
  }
  return fmt;
}

export function formatRelative(date: Date, ref: Date = new Date(), locale?: string): string {
  const diffMs = date.getTime() - ref.getTime();
  const abs = Math.abs(diffMs);
  const relTime = relTimeFor(locale);
  if (abs < 60_000) return relTime.format(Math.round(diffMs / 1000), 'second');
  if (abs < 3_600_000) return relTime.format(Math.round(diffMs / 60_000), 'minute');
  if (abs < DAY_MS) return relTime.format(Math.round(diffMs / 3_600_000), 'hour');
  if (abs < 7 * DAY_MS) return relTime.format(Math.round(diffMs / DAY_MS), 'day');
  return monthDayFor(locale).format(date);
}
