import { eq, and, desc } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
    favorites,
    type Favorite,
    type FavoriteType,
} from './schema';

type DB = ExpoSQLiteDatabase;

// ─── Input types ──────────────────────────────────────────────

export interface CreateFavoriteInput {
    type: FavoriteType;
    name: string;
    mealText: string;
    calories?: number | null;
    sourceMealId?: number | null;
}

export interface UpdateFavoriteInput {
    name?: string;
    mealText?: string;
    calories?: number | null;
}

// ─── CRUD Operations ─────────────────────────────────────────

/**
 * Get all favorites of a given type, ordered by creation date descending.
 */
export function getFavoritesByType(db: DB, type: FavoriteType): Favorite[] {
    return db
        .select()
        .from(favorites)
        .where(eq(favorites.type, type))
        .orderBy(desc(favorites.createdAt))
        .all();
}

/**
 * Get a single favorite by ID.
 */
export function getFavoriteById(db: DB, id: number): Favorite | undefined {
    return db
        .select()
        .from(favorites)
        .where(eq(favorites.id, id))
        .get();
}

/**
 * Create a new favorite.
 */
export function createFavorite(db: DB, input: CreateFavoriteInput): Favorite {
    const now = new Date().toISOString();
    return db
        .insert(favorites)
        .values({
            type: input.type,
            name: input.name,
            mealText: input.mealText,
            calories: input.calories ?? null,
            sourceMealId: input.sourceMealId ?? null,
            createdAt: now,
        })
        .returning()
        .get();
}

/**
 * Update a favorite template.
 */
export function updateFavorite(
    db: DB,
    id: number,
    input: UpdateFavoriteInput
): Favorite | undefined {
    const existing = getFavoriteById(db, id);
    if (!existing) return undefined;

    return db
        .update(favorites)
        .set({
            name: input.name ?? existing.name,
            mealText: input.mealText ?? existing.mealText,
            calories: input.calories !== undefined ? input.calories : existing.calories,
        })
        .where(eq(favorites.id, id))
        .returning()
        .get();
}

/**
 * Delete a favorite by ID.
 */
export function deleteFavorite(db: DB, id: number): void {
    db.delete(favorites).where(eq(favorites.id, id)).run();
}

/**
 * Check if a meal is starred (has a 'starred' favorite entry).
 */
export function isMealStarred(db: DB, mealId: number): boolean {
    const row = db
        .select()
        .from(favorites)
        .where(
            and(
                eq(favorites.type, 'starred'),
                eq(favorites.sourceMealId, mealId)
            )
        )
        .get();
    return !!row;
}

/**
 * Toggle starred status. Creates or removes a 'starred' favorite entry.
 * Returns true if now starred, false if unstarred.
 */
export function toggleStarredMeal(
    db: DB,
    mealId: number,
    mealName: string,
    mealText: string,
    mealCalories: number | null
): boolean {
    const existing = db
        .select()
        .from(favorites)
        .where(
            and(
                eq(favorites.type, 'starred'),
                eq(favorites.sourceMealId, mealId)
            )
        )
        .get();

    if (existing) {
        db.delete(favorites).where(eq(favorites.id, existing.id)).run();
        return false;
    } else {
        createFavorite(db, {
            type: 'starred',
            name: mealName,
            mealText,
            calories: mealCalories,
            sourceMealId: mealId,
        });
        return true;
    }
}
