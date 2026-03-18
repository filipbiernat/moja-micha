import { eq, desc, sql, and, gte, lte, isNotNull } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { meals, type Meal, type NewMeal, type MealType } from './schema';

type DB = ExpoSQLiteDatabase;

// ─── Input types ──────────────────────────────────────────────

export interface CreateMealInput {
    date: string;
    time: string;
    mealType: MealType;
    mealText: string;
    calories?: number | null;
    aiAnalysis?: string | null;
}

export interface UpdateMealInput {
    date?: string;
    time?: string;
    mealType?: MealType;
    mealText?: string;
    calories?: number | null;
    aiAnalysis?: string | null;
}

// ─── CRUD Operations ─────────────────────────────────────────

/**
 * Get all meals for a given date, ordered by time descending.
 */
export function getMealsByDate(db: DB, date: string): Meal[] {
    return db
        .select()
        .from(meals)
        .where(eq(meals.date, date))
        .orderBy(desc(meals.time))
        .all();
}

/**
 * Get a single meal by ID.
 */
export function getMealById(db: DB, id: number): Meal | undefined {
    return db
        .select()
        .from(meals)
        .where(eq(meals.id, id))
        .get();
}

/**
 * Create a new meal.
 */
export function createMeal(db: DB, input: CreateMealInput): Meal {
    const now = new Date().toISOString();
    return db
        .insert(meals)
        .values({
            date: input.date,
            time: input.time,
            mealType: input.mealType,
            mealText: input.mealText,
            calories: input.calories ?? null,
            aiAnalysis: input.aiAnalysis ?? null,
            isStarred: 0,
            createdAt: now,
            updatedAt: now,
        })
        .returning()
        .get();
}

/**
 * Update an existing meal.
 */
export function updateMeal(
    db: DB,
    id: number,
    input: UpdateMealInput
): Meal | undefined {
    const now = new Date().toISOString();
    const existing = getMealById(db, id);
    if (!existing) return undefined;

    return db
        .update(meals)
        .set({
            date: input.date ?? existing.date,
            time: input.time ?? existing.time,
            mealType: input.mealType ?? existing.mealType,
            mealText: input.mealText ?? existing.mealText,
            calories: input.calories !== undefined ? input.calories : existing.calories,
            aiAnalysis: input.aiAnalysis !== undefined ? input.aiAnalysis : existing.aiAnalysis,
            updatedAt: now,
        })
        .where(eq(meals.id, id))
        .returning()
        .get();
}

/**
 * Delete a meal by ID.
 */
export function deleteMeal(db: DB, id: number): void {
    db.delete(meals).where(eq(meals.id, id)).run();
}

/**
 * Toggle the starred status of a meal. Returns new is_starred value.
 */
export function toggleMealStarred(db: DB, id: number): boolean {
    const meal = getMealById(db, id);
    if (!meal) return false;

    const newValue = meal.isStarred === 1 ? 0 : 1;
    db.update(meals)
        .set({ isStarred: newValue, updatedAt: new Date().toISOString() })
        .where(eq(meals.id, id))
        .run();
    return newValue === 1;
}

/**
 * Check if a meal is starred.
 */
export function isMealStarred(db: DB, id: number): boolean {
    const meal = getMealById(db, id);
    return meal?.isStarred === 1;
}

/**
 * Explicitly set the starred status of a meal.
 */
export function setMealStarred(db: DB, id: number, starred: boolean): void {
    db.update(meals)
        .set({ isStarred: starred ? 1 : 0, updatedAt: new Date().toISOString() })
        .where(eq(meals.id, id))
        .run();
}

/**
 * Get the N most recent unique meal_text values (for autocomplete).
 */
export function getRecentUniqueMeals(db: DB, limit: number = 20): string[] {
    const rows = db
        .selectDistinct({ mealText: meals.mealText })
        .from(meals)
        .orderBy(desc(meals.createdAt))
        .limit(limit)
        .all();
    return rows.map((r) => r.mealText);
}

/**
 * Get the current streak (consecutive days with at least one meal).
 */
export function getStreak(db: DB): number {
    const rows = db
        .selectDistinct({ date: meals.date })
        .from(meals)
        .orderBy(desc(meals.date))
        .all();

    if (rows.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDate = new Date(rows[0].date + 'T00:00:00');
    const diffFromToday = Math.floor(
        (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffFromToday > 1) return 0;

    let streak = 0;
    let expectedDate = firstDate;

    for (const row of rows) {
        const rowDate = new Date(row.date + 'T00:00:00');
        const diff = Math.floor(
            (expectedDate.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 0) {
            streak++;
            expectedDate = new Date(rowDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

/**
 * Get all unique dates in the given range that have at least one meal.
 */
export function getDatesWithMeals(
    db: DB,
    startDate: string,
    endDate: string
): string[] {
    const rows = db
        .selectDistinct({ date: meals.date })
        .from(meals)
        .where(and(gte(meals.date, startDate), lte(meals.date, endDate)))
        .orderBy(meals.date)
        .all();
    return rows.map((r) => r.date);
}

/**
 * Get the all-time record (longest) streak of consecutive days with at least one meal.
 */
export function getRecordStreak(db: DB): number {
    const rows = db
        .selectDistinct({ date: meals.date })
        .from(meals)
        .orderBy(meals.date)
        .all();

    if (rows.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < rows.length; i++) {
        const prev = new Date(rows[i - 1].date + 'T00:00:00');
        const curr = new Date(rows[i].date + 'T00:00:00');
        const diff = Math.floor(
            (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

/**
 * Get calorie summary for a date range.
 */
export function getCalorieSummary(
    db: DB,
    startDate: string,
    endDate: string
): { date: string; totalCalories: number }[] {
    const rows = db
        .select({
            date: meals.date,
            totalCalories: sql<number>`COALESCE(SUM(${meals.calories}), 0)`,
        })
        .from(meals)
        .where(
            and(
                gte(meals.date, startDate),
                lte(meals.date, endDate),
                isNotNull(meals.calories)
            )
        )
        .groupBy(meals.date)
        .orderBy(meals.date)
        .all();
    return rows;
}
