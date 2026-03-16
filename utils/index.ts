import type { MealType } from '../db/schema';

// ─── Date/Time Helpers ────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time. */
export function getLocalDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Returns the current time as HH:MM in local time. */
export function getLocalTimeString(): string {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/** Returns the appropriate MealType for the given Date based on the hour. */
export function getMealTypeForCurrentTime(date: Date): MealType {
    const hour = date.getHours();
    if (hour >= 5 && hour < 10) return 'breakfast';
    if (hour >= 10 && hour < 12) return 'second_breakfast';
    if (hour >= 12 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'afternoon_snack';
    if (hour >= 18 && hour < 21) return 'dinner';
    return 'snack';
}

