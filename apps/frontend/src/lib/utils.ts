import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDecimalNumber(intValue: number, decimal: number): number {
  if (!Number.isFinite(intValue)) return 0
  const sign = intValue < 0 ? -1 : 1
  const abs = Math.abs(Math.trunc(intValue))
  if (!decimal || decimal <= 0) return sign * abs
  const s = String(abs).padStart(decimal + 1, "0")
  const whole = s.slice(0, s.length - decimal)
  const frac = s.slice(s.length - decimal)
  return sign * Number(`${whole}.${frac}`)
}
