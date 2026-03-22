import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
    settings,
    SETTING_KEYS,
    type DietGoal,
    type SettingKey,
    type UserSex,
} from './schema';

type DB = ExpoSQLiteDatabase;

export interface UserProfileSettings {
    sex: UserSex;
    age: number | null;
    dietGoal: DietGoal;
}

/**
 * Get a single setting value by key. Returns null if not found.
 */
export function getSetting(db: DB, key: SettingKey): string | null {
    const row = db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .get();
    return row?.value ?? null;
}

/**
 * Set a setting value (upsert).
 */
export function setSetting(db: DB, key: SettingKey, value: string): void {
    db.insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({
            target: settings.key,
            set: { value },
        })
        .run();
}

/**
 * Get all settings as a key→value record.
 */
export function getAllSettings(db: DB): Record<string, string> {
    const rows = db.select().from(settings).all();
    const result: Record<string, string> = {};
    for (const row of rows) {
        result[row.key] = row.value;
    }
    return result;
}

/**
 * Delete a setting.
 */
export function deleteSetting(db: DB, key: SettingKey): void {
    db.delete(settings).where(eq(settings.key, key)).run();
}

export function getUserProfileSettings(db: DB): UserProfileSettings {
    const storedSex = getSetting(db, SETTING_KEYS.PROFILE_SEX);
    const storedAge = getSetting(db, SETTING_KEYS.PROFILE_AGE);
    const storedDietGoal = getSetting(db, SETTING_KEYS.DIET_GOAL);

    const sex: UserSex =
        storedSex === 'female' || storedSex === 'male' || storedSex === 'unspecified'
            ? storedSex
            : 'unspecified';

    const ageNumber = storedAge ? parseInt(storedAge, 10) : NaN;
    const age = Number.isFinite(ageNumber) && ageNumber > 0 ? ageNumber : null;

    const dietGoal: DietGoal =
        storedDietGoal === 'fat_loss' ||
        storedDietGoal === 'maintain' ||
        storedDietGoal === 'muscle_gain'
            ? storedDietGoal
            : 'maintain';

    return { sex, age, dietGoal };
}
