import type { SessionByDateResponse } from "@/components/typings/apiResponse";

// Booking maths shared by New Session, See the day and Pitch bookings.
// Times are minutes from the start of a calendar day ("YYYY-MM-DD", device
// local time — the app and the API's Lagos day agree for players in Nigeria).

/** How many days ahead (today included) a pitch can be booked. */
export const BOOKING_DAYS = 14;
export const DAY_MINUTES = 24 * 60;

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Redux key for one pitch's bookings on one day. */
export const locationDayKey = (locationId: string, date: string) =>
  `${locationId}|${date}`;

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => dateKey(new Date());

export const keyToDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Today and the following days, as date keys. */
export const upcomingDays = (count = BOOKING_DAYS) => {
  const start = new Date();
  return Array.from({ length: count }, (_, i) =>
    dateKey(
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    ),
  );
};

export const isValidDayKey = (key: unknown): key is string =>
  typeof key === "string" && upcomingDays().includes(key);

export const toMinutes = (hhmm?: string) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

export const toHHMM = (minutes: number) =>
  `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

/** The start of `minute` on day `key`, as a Date. */
export const startDate = (key: string, minute: number) => {
  const d = keyToDate(key);
  d.setMinutes(minute);
  return d;
};

/**
 * The opening window in minutes. Closing at/before opening means open
 * overnight or 24h: the window then runs to midnight.
 */
export function pitchWindow(openingHour?: string, closingHour?: string) {
  const open = toMinutes(openingHour) ?? 0;
  const closeRaw = toMinutes(closingHour);
  const close = closeRaw == null || closeRaw <= open ? DAY_MINUTES : closeRaw;
  return { open, close };
}

/** Minutes since midnight now, if `key` is today; otherwise null. */
export const nowOn = (key: string) => {
  if (key !== todayKey()) return null;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/**
 * Sessions that hold the pitch. Matches the server's 409 check: only
 * cancelled and refunded sessions free the slot.
 */
export const activeBookings = (sessions: SessionByDateResponse[]) =>
  sessions.filter(
    (s: any) =>
      s?.startTime &&
      s?.stopTime &&
      s.status !== "CANCELLED" &&
      s.status !== "REFUNDED",
  );

export interface BookedRange {
  /** Clipped to the day. */
  start: number;
  end: number;
}

/** Booked periods on day `key`, merged and sorted, clipped to the day. */
export function bookedRanges(
  sessions: SessionByDateResponse[],
  key: string,
): BookedRange[] {
  const dayStart = keyToDate(key).getTime();
  const ranges = activeBookings(sessions)
    .map((s) => ({
      start: Math.max(0, (new Date(s.startTime).getTime() - dayStart) / 60000),
      end: Math.min(
        DAY_MINUTES,
        (new Date(s.stopTime).getTime() - dayStart) / 60000,
      ),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  const merged: BookedRange[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  return merged;
}

const overlaps = (ranges: BookedRange[], start: number, end: number) =>
  ranges.some((r) => r.start < end && r.end > start);

export interface Gap {
  start: number;
  end: number;
}

/** Free periods on day `key` from now (if today) or opening, until closing. */
export function freeGaps(
  sessions: SessionByDateResponse[],
  key: string,
  openingHour?: string,
  closingHour?: string,
): Gap[] {
  const { open, close } = pitchWindow(openingHour, closingHour);
  const now = nowOn(key);
  let cursor = Math.max(open, now == null ? 0 : now);
  const gaps: Gap[] = [];
  for (const r of bookedRanges(sessions, key)) {
    if (r.start > cursor)
      gaps.push({ start: cursor, end: Math.min(r.start, close) });
    cursor = Math.max(cursor, r.end);
  }
  if (cursor < close) gaps.push({ start: cursor, end: close });
  return gaps.filter((g) => g.end > g.start);
}

export const longestGap = (gaps: Gap[]) =>
  gaps.reduce<Gap | null>(
    (best, g) => (!best || g.end - g.start > best.end - best.start ? g : best),
    null,
  );

export interface StartOption {
  minute: number;
  /** The whole game fits here. */
  free: boolean;
}

/**
 * Start times where a game of `duration` minutes would end by closing:
 * every hour from opening plus the end of each booking. Past times on
 * today are left out; ones that clash with a booking are `free: false`.
 */
export function startTimeOptions(
  sessions: SessionByDateResponse[],
  key: string,
  openingHour: string | undefined,
  closingHour: string | undefined,
  duration: number,
): StartOption[] {
  if (!(duration > 0)) return [];
  const { open, close } = pitchWindow(openingHour, closingHour);
  const now = nowOn(key);
  const booked = bookedRanges(sessions, key);

  const candidates = new Set<number>();
  for (let m = open; m + duration <= close; m += 60) candidates.add(m);
  for (const r of booked)
    if (r.end >= open && r.end + duration <= close) candidates.add(r.end);

  return [...candidates]
    .filter((m) => now == null || m >= now)
    .sort((a, b) => a - b)
    .map((minute) => ({
      minute,
      free: !overlaps(booked, minute, minute + duration),
    }));
}

/** Free start times only. */
export const freeStarts = (...args: Parameters<typeof startTimeOptions>) =>
  startTimeOptions(...args)
    .filter((o) => o.free)
    .map((o) => o.minute);

/** Does start..start+duration fit inside a free gap? */
export const fitsAt = (gaps: Gap[], start: number, duration: number) =>
  gaps.some((g) => g.start <= start && start + duration <= g.end);

/**
 * The booking that overlaps start..start+minutes, if any — to warn before
 * the server answers 409 "time slot conflicts".
 */
export function overlappingBooking(
  sessions: SessionByDateResponse[],
  start: Date,
  minutes: number,
) {
  const end = start.getTime() + minutes * 60000;
  return (
    activeBookings(sessions).find(
      (s) =>
        new Date(s.startTime).getTime() < end &&
        new Date(s.stopTime).getTime() > start.getTime(),
    ) ?? null
  );
}

// ── Formatting ───────────────────────────────────────────────────────────

/** 1140 → "7 PM", 1170 → "7:30 PM". */
export function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${pad(m)} ${suffix}` : `${h12} ${suffix}`;
}

/** "7 – 9 PM", "11 AM – 1 PM". */
export function formatRange(start: number, end: number) {
  const a = formatClock(start);
  const b = formatClock(end);
  const sa = a.slice(-2);
  return sa === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`;
}

/** 120 → "2 hours", 90 → "1 hr 30 min", 45 → "45 min". */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!m) return h === 1 ? "1 hour" : `${h} hours`;
  if (!h) return `${m} min`;
  return `${h} hr ${m} min`;
}

/** 120 → "2-hour", 90 → "90-minute". */
export const durationAdjective = (minutes: number) =>
  minutes % 60 === 0 ? `${minutes / 60}-hour` : `${minutes}-minute`;

/** "Tue 17 Nov". */
export function formatDayShort(key: string) {
  const d = keyToDate(key);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export const weekdayShort = (key: string) => WEEKDAYS[keyToDate(key).getDay()];
export const dayOfMonth = (key: string) => keyToDate(key).getDate();
export const monthLong = (key: string) =>
  MONTHS_LONG[keyToDate(key).getMonth()];
