import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/id"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const WIB_TZ = "Asia/Jakarta"

const DAY_MAP: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
}

const MONTH_MAP: Record<string, string> = {
  january: "Januari",
  february: "Februari",
  march: "Maret",
  april: "April",
  may: "Mei",
  june: "Juni",
  july: "Juli",
  august: "Agustus",
  september: "September",
  october: "Oktober",
  november: "November",
  december: "Desember",
}

/**
 * Format a date/time to WIB timezone and Indonesian locale.
 *
 * Output example: "Senin, 27 Oktober 2025 11:55 WIB"
 *
 * Accepts a Date, ISO string, timestamp (number), or null/undefined.
 * Returns '-' when input is falsy or invalid.
 */
export function formatToWIB(input?: string | number | Date | null): string {
  if (!input) return "-"

  const d = dayjs.utc(input)
  if (!d.isValid()) return "-"

  const formatted = d.tz(WIB_TZ).locale("id").format("dddd, D MMMM YYYY HH:mm")
  return `${capitalizeFirst(formatted)} WIB`
}

/**
 * Convert an English day name (case-insensitive) to Indonesian.
 * e.g. 'monday' -> 'Senin'
 */
export function toIndonesianDay(eng: string): string {
  if (!eng) return eng
  const key = eng.trim().toLowerCase()
  return DAY_MAP[key] || capitalizeFirst(eng)
}

/**
 * Convert an English month name (case-insensitive) to Indonesian.
 * e.g. 'October' -> 'Oktober'
 */
export function toIndonesianMonth(eng: string): string {
  if (!eng) return eng
  const key = eng.trim().toLowerCase()
  return MONTH_MAP[key] || capitalizeFirst(eng)
}

function capitalizeFirst(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
