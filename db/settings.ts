import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { settings, type SettingKey } from './schema';

type DB = ExpoSQLiteDatabase;

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
