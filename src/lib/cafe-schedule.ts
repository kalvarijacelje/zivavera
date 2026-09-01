export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DaySchedule = {
  enabled: boolean;
  open: string; // e.g. "08:00"
  close: string; // e.g. "14:00"
};

export type WeeklySchedule = Record<DayKey, DaySchedule>;

export type CafeMode = "auto" | "manual_open" | "manual_closed";

export type CafeStatusRecord = {
  is_open: boolean;
  mode?: CafeMode | string | null;
  schedule?: WeeklySchedule | any | null;
  override_until?: string | null;
  note_en?: string | null;
  note_sl?: string | null;
  updated_at?: string;
};

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  mon: { enabled: true, open: "08:00", close: "14:00" },
  tue: { enabled: true, open: "08:00", close: "14:00" },
  wed: { enabled: true, open: "08:00", close: "14:00" },
  thu: { enabled: true, open: "08:00", close: "14:00" },
  fri: { enabled: true, open: "08:00", close: "14:00" },
  sat: { enabled: false, open: "09:00", close: "13:00" },
  sun: { enabled: false, open: "09:00", close: "13:00" },
};

export const DAYS_ORDER: {
  key: DayKey;
  nameSl: string;
  nameEn: string;
  shortSl: string;
  shortEn: string;
}[] = [
  { key: "mon", nameSl: "Ponedeljek", nameEn: "Monday", shortSl: "Pon", shortEn: "Mon" },
  { key: "tue", nameSl: "Torek", nameEn: "Tuesday", shortSl: "Tor", shortEn: "Tue" },
  { key: "wed", nameSl: "Sreda", nameEn: "Wednesday", shortSl: "Sre", shortEn: "Wed" },
  { key: "thu", nameSl: "Četrtek", nameEn: "Thursday", shortSl: "Čet", shortEn: "Thu" },
  { key: "fri", nameSl: "Petek", nameEn: "Friday", shortSl: "Pet", shortEn: "Fri" },
  { key: "sat", nameSl: "Sobota", nameEn: "Saturday", shortSl: "Sob", shortEn: "Sat" },
  { key: "sun", nameSl: "Nedelja", nameEn: "Sunday", shortSl: "Ned", shortEn: "Sun" },
];

export function timeToMinutes(t: string): number {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

export function getLjubljanaTime(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Ljubljana",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value?.toLowerCase() || "";
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  const dayMap: Record<string, DayKey> = {
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
    sun: "sun",
  };

  const currentDayKey: DayKey = dayMap[weekday.slice(0, 3)] || "mon";
  const currentMinutes = hour * 60 + minute;
  return { currentDayKey, hour, minute, currentMinutes };
}

export type EvaluatedCafeStatus = {
  isOpen: boolean;
  mode: CafeMode;
  isOverride: boolean;
  statusTextSl: string;
  statusTextEn: string;
  effectiveSchedule: WeeklySchedule;
};

export function evaluateCafeStatus(
  statusRecord: CafeStatusRecord | null,
  now = new Date()
): EvaluatedCafeStatus {
  const effectiveSchedule: WeeklySchedule = {
    ...DEFAULT_SCHEDULE,
    ...(typeof statusRecord?.schedule === "object" && statusRecord?.schedule !== null
      ? statusRecord.schedule
      : {}),
  };

  const rawMode: CafeMode = (statusRecord?.mode as CafeMode) || "auto";
  const overrideUntil = statusRecord?.override_until ? new Date(statusRecord.override_until) : null;
  const overrideExpired = overrideUntil ? now.getTime() >= overrideUntil.getTime() : false;

  // Check manual overrides if active and not expired
  if (rawMode === "manual_open" && !overrideExpired) {
    return {
      isOpen: true,
      mode: "manual_open",
      isOverride: true,
      statusTextSl: overrideUntil
        ? `Odprto (ročni vklop do ${overrideUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
        : "Odprto (ročni vklop)",
      statusTextEn: overrideUntil
        ? `Open (manual override until ${overrideUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
        : "Open (manual override)",
      effectiveSchedule,
    };
  }

  if (rawMode === "manual_closed" && !overrideExpired) {
    return {
      isOpen: false,
      mode: "manual_closed",
      isOverride: true,
      statusTextSl: overrideUntil
        ? `Zaprto (ročni izklop do ${overrideUntil.toLocaleDateString("sl-SI")} ${overrideUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
        : "Zaprto (ročni izklop)",
      statusTextEn: overrideUntil
        ? `Closed (manual override until ${overrideUntil.toLocaleDateString("en-US")} ${overrideUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
        : "Closed (manual override)",
      effectiveSchedule,
    };
  }

  // AUTO SCHEDULE EVALUATION in Europe/Ljubljana
  const { currentDayKey, currentMinutes } = getLjubljanaTime(now);
  const todaySched = effectiveSchedule[currentDayKey];

  if (todaySched?.enabled) {
    const openMin = timeToMinutes(todaySched.open);
    const closeMin = timeToMinutes(todaySched.close);

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      return {
        isOpen: true,
        mode: "auto",
        isOverride: false,
        statusTextSl: `Odprto do ${todaySched.close}`,
        statusTextEn: `Open until ${todaySched.close}`,
        effectiveSchedule,
      };
    }

    if (currentMinutes < openMin) {
      return {
        isOpen: false,
        mode: "auto",
        isOverride: false,
        statusTextSl: `Odpre se danes ob ${todaySched.open}`,
        statusTextEn: `Opens today at ${todaySched.open}`,
        effectiveSchedule,
      };
    }
  }

  // Find next upcoming opening day
  const dayKeys: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const currentIdx = dayKeys.indexOf(currentDayKey);
  let nextOpenTextSl = "Zaprto";
  let nextOpenTextEn = "Closed";

  for (let i = 1; i <= 7; i++) {
    const nextIdx = (currentIdx + i) % 7;
    const nextKey = dayKeys[nextIdx];
    const nextDaySched = effectiveSchedule[nextKey];
    if (nextDaySched?.enabled) {
      const dayMeta = DAYS_ORDER.find((d) => d.key === nextKey);
      if (i === 1) {
        nextOpenTextSl = `Odpre se jutri ob ${nextDaySched.open}`;
        nextOpenTextEn = `Opens tomorrow at ${nextDaySched.open}`;
      } else {
        nextOpenTextSl = `Odpre se v ${dayMeta?.nameSl.toLowerCase() || nextKey} ob ${nextDaySched.open}`;
        nextOpenTextEn = `Opens ${dayMeta?.nameEn || nextKey} at ${nextDaySched.open}`;
      }
      break;
    }
  }

  return {
    isOpen: false,
    mode: "auto",
    isOverride: false,
    statusTextSl: nextOpenTextSl,
    statusTextEn: nextOpenTextEn,
    effectiveSchedule,
  };
}
