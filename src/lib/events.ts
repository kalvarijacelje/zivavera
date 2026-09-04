import type { Locale } from "@/i18n/translations";

export type RecurrenceInterval = "weekly" | "biweekly" | "monthly";

export interface RecurringEventData {
  id?: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string | null; // HH:mm or HH:mm:ss
  is_recurring?: boolean | null;
  recurrence_interval?: string | null;
}

export interface EffectiveEventResult {
  effectiveDate: string; // YYYY-MM-DD
  originalDate: string;
  isRecurring: boolean;
  recurrenceInterval: RecurrenceInterval;
  isToday: boolean;
  isPast: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  dayName: { en: string; sl: string };
}

export const DAYS_OF_WEEK = [
  { index: 0, en: "Sunday", sl: "Nedelja", enShort: "Sun", slShort: "Ned", enLocative: "Sunday", slLocative: "nedeljo" },
  { index: 1, en: "Monday", sl: "Ponedeljek", enShort: "Mon", slShort: "Pon", enLocative: "Monday", slLocative: "ponedeljek" },
  { index: 2, en: "Tuesday", sl: "Torek", enShort: "Tue", slShort: "Tor", enLocative: "Tuesday", slLocative: "torek" },
  { index: 3, en: "Wednesday", sl: "Sreda", enShort: "Wed", slShort: "Sre", enLocative: "Wednesday", slLocative: "sredo" },
  { index: 4, en: "Thursday", sl: "Četrtek", enShort: "Thu", slShort: "Čet", enLocative: "Thursday", slLocative: "četrtek" },
  { index: 5, en: "Friday", sl: "Petek", enShort: "Fri", slShort: "Pet", enLocative: "Friday", slLocative: "petek" },
  { index: 6, en: "Saturday", sl: "Sobota", enShort: "Sat", slShort: "Sob", enLocative: "Saturday", slLocative: "soboto" },
];

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date at 00:00:00
 */
export function parseDateYMD(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

/**
 * Calculate expiry time for an event occurrence.
 * An event is considered active on its day until the event time + 3 hours,
 * or until the end of that day (23:59:59), whichever is later.
 */
export function getOccurrenceExpiry(dateYMD: string, timeStr?: string | null): Date {
  const [y, m, d] = dateYMD.split("-").map(Number);
  if (!timeStr) {
    // End of the day
    return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
  }
  const [h, min] = timeStr.split(":").map(Number);
  // Default end time: 3 hours after start, but at least end of day
  const expiry = new Date(y, (m || 1) - 1, d || 1, (h || 0) + 3, min || 0, 0, 0);
  const endOfDay = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
  return expiry > endOfDay ? expiry : endOfDay;
}

/**
 * Computes the effective occurrence date for any event.
 * If the event is recurring, rolls the date forward automatically until the occurrence
 * is in the present/future (i.e. has not yet expired relative to now).
 */
export function getEffectiveEventDate(
  event: RecurringEventData,
  now: Date = new Date()
): EffectiveEventResult {
  const isRecurring = Boolean(event.is_recurring);
  const interval = (event.recurrence_interval as RecurrenceInterval) || "weekly";
  const origDate = parseDateYMD(event.event_date);
  const dayOfWeek = origDate.getDay();
  const dayInfo = DAYS_OF_WEEK[dayOfWeek] || DAYS_OF_WEEK[0];

  if (!isRecurring) {
    const expiry = getOccurrenceExpiry(event.event_date, event.event_time);
    const isPast = now.getTime() > expiry.getTime();
    const isToday = formatDateYMD(now) === event.event_date;
    return {
      effectiveDate: event.event_date,
      originalDate: event.event_date,
      isRecurring: false,
      recurrenceInterval: interval,
      isToday,
      isPast,
      dayOfWeek,
      dayName: { en: dayInfo.en, sl: dayInfo.sl },
    };
  }

  // Event is recurring: Roll forward until expiry is >= now
  let curr = new Date(origDate.getTime());
  let expiry = getOccurrenceExpiry(formatDateYMD(curr), event.event_time);

  // Safety break to prevent infinite loops if misconfigured
  let iterations = 0;
  const maxIterations = 520; // 10 years of weeks

  while (now.getTime() > expiry.getTime() && iterations < maxIterations) {
    iterations++;
    if (interval === "monthly") {
      curr.setMonth(curr.getMonth() + 1);
    } else if (interval === "biweekly") {
      curr.setDate(curr.getDate() + 14);
    } else {
      // weekly
      curr.setDate(curr.getDate() + 7);
    }
    expiry = getOccurrenceExpiry(formatDateYMD(curr), event.event_time);
  }

  const effectiveDateStr = formatDateYMD(curr);
  const isToday = formatDateYMD(now) === effectiveDateStr;

  return {
    effectiveDate: effectiveDateStr,
    originalDate: event.event_date,
    isRecurring: true,
    recurrenceInterval: interval,
    isToday,
    isPast: false, // Recurring events roll forward so they are not in the past
    dayOfWeek,
    dayName: { en: dayInfo.en, sl: dayInfo.sl },
  };
}

/**
 * Localized recurrence badge or text description
 */
export function formatRecurrenceLabel(
  interval: string | null | undefined,
  dayOfWeek: number,
  locale: Locale,
  time?: string | null
): string {
  const day = DAYS_OF_WEEK[dayOfWeek] || DAYS_OF_WEEK[5]; // default Friday
  const timeFormatted = time ? ` ob ${time.slice(0, 5)}` : "";
  const timeFormattedEn = time ? ` at ${time.slice(0, 5)}` : "";

  if (locale === "sl") {
    switch (interval) {
      case "biweekly":
        return `Vsaka 2 tedna v ${day.slLocative}${timeFormatted}`;
      case "monthly":
        return `Vsak mesec v ${day.slLocative}${timeFormatted}`;
      case "weekly":
      default:
        return `Vsak ${day.slLocative}${timeFormatted}`;
    }
  }

  // English
  switch (interval) {
    case "biweekly":
      return `Every 2 weeks on ${day.en}${timeFormattedEn}`;
    case "monthly":
      return `Monthly on ${day.en}${timeFormattedEn}`;
    case "weekly":
    default:
      return `Every ${day.en}${timeFormattedEn}`;
  }
}
