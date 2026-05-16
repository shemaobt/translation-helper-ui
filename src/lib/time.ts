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
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'Previous 7 days', items: week },
    { label: 'Previous 30 days', items: month },
    { label: 'Older', items: older },
  ].filter((b) => b.items.length > 0);
}

const relTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const monthDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

export function formatRelative(date: Date, ref: Date = new Date()): string {
  const diffMs = date.getTime() - ref.getTime();
  const abs = Math.abs(diffMs);
  if (abs < 60_000) return relTime.format(Math.round(diffMs / 1000), 'second');
  if (abs < 3_600_000) return relTime.format(Math.round(diffMs / 60_000), 'minute');
  if (abs < DAY_MS) return relTime.format(Math.round(diffMs / 3_600_000), 'hour');
  if (abs < 7 * DAY_MS) return relTime.format(Math.round(diffMs / DAY_MS), 'day');
  return monthDay.format(date);
}
