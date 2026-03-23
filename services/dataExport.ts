import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
    meals,
    favorites,
    dailySummaries,
    settings,
    SETTING_KEYS,
    type MealType,
    type FavoriteType,
} from '../db/schema';

// ─── Types ───────────────────────────────────────────────────

interface BackupMeal {
    id: number;
    date: string;
    time: string;
    mealType: string;
    mealText: string;
    calories: number | null;
    aiAnalysis: string | null;
    isStarred: number;
    createdAt: string;
    updatedAt: string;
}

interface BackupFavorite {
    id: number;
    type: string;
    name: string;
    mealText: string;
    calories: number | null;
    sourceMealId: number | null;
    createdAt: string;
}

interface BackupDailySummary {
    date: string;
    content: string;
    generatedAt: number;
}

export interface AppBackup {
    version: 1;
    exportedAt: string;
    meals: BackupMeal[];
    favorites: BackupFavorite[];
    dailySummaries: BackupDailySummary[];
    settings: Record<string, string>;
}

// Settings keys that must never appear in an export file
const EXCLUDED_SETTING_KEYS: string[] = [SETTING_KEYS.OPENAI_API_KEY];

// ─── Sentinel for user-initiated cancel ──────────────────────

export class CancelledError extends Error {
    constructor() {
        super('Cancelled by user');
    }
}

// ─── Export ──────────────────────────────────────────────────

/**
 * Collects all data from the local database (excluding sensitive settings),
 * writes a JSON file to the cache directory, and opens the OS share sheet.
 */
export async function exportData(db: ExpoSQLiteDatabase): Promise<void> {
    const allMeals = db.select().from(meals).all();
    const allFavorites = db.select().from(favorites).all();
    const allSummaries = db.select().from(dailySummaries).all();
    const allSettings = db.select().from(settings).all();

    const settingsRecord: Record<string, string> = {};
    for (const row of allSettings) {
        if (!EXCLUDED_SETTING_KEYS.includes(row.key)) {
            settingsRecord[row.key] = row.value;
        }
    }

    const backup: AppBackup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        meals: allMeals.map((m) => ({
            id: m.id,
            date: m.date,
            time: m.time,
            mealType: m.mealType,
            mealText: m.mealText,
            calories: m.calories ?? null,
            aiAnalysis: m.aiAnalysis ?? null,
            isStarred: m.isStarred,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        })),
        favorites: allFavorites.map((f) => ({
            id: f.id,
            type: f.type,
            name: f.name,
            mealText: f.mealText,
            calories: f.calories ?? null,
            sourceMealId: f.sourceMealId ?? null,
            createdAt: f.createdAt,
        })),
        dailySummaries: allSummaries.map((s) => ({
            date: s.date,
            content: s.content,
            generatedAt: s.generatedAt,
        })),
        settings: settingsRecord,
    };

    const json = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `moja-micha-${dateStr}.json`;
    const file = new File(Paths.cache, fileName);
    file.write(json);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
        throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: fileName,
        UTI: 'public.json',
    });
}

// ─── Import ──────────────────────────────────────────────────

/**
 * Opens the document picker, reads the selected file, and returns a validated
 * AppBackup object. Throws CancelledError if the user dismissed the picker.
 */
export async function pickAndParseBackup(): Promise<AppBackup> {
    const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
    });

    if (result.canceled) {
        throw new CancelledError();
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
        throw new Error('No file selected');
    }

    const assetFile = new File(asset.uri);
    const content = await assetFile.text();

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error('Invalid JSON file');
    }

    return validateBackup(parsed);
}

function validateBackup(data: unknown): AppBackup {
    if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid backup: not an object');
    }
    const d = data as Record<string, unknown>;
    if (d['version'] !== 1) {
        throw new Error('Unsupported backup version: ' + String(d['version']));
    }
    if (
        !Array.isArray(d['meals']) ||
        !Array.isArray(d['favorites']) ||
        !Array.isArray(d['dailySummaries'])
    ) {
        throw new Error('Invalid backup structure');
    }
    if (
        typeof d['settings'] !== 'object' ||
        Array.isArray(d['settings']) ||
        d['settings'] === null
    ) {
        throw new Error('Invalid backup structure: settings must be an object');
    }
    return d as unknown as AppBackup;
}

/**
 * Clears all existing app data and restores from the provided backup.
 * Runs inside a single database transaction — if any step fails the
 * database is rolled back to its previous state.
 * Settings not present in the backup (e.g. the OpenAI API key) are
 * left untouched in the database.
 */
export function restoreFromBackup(
    db: ExpoSQLiteDatabase,
    backup: AppBackup,
): void {
    db.transaction((tx) => {
        // Delete favorites before meals (favorites may FK-reference meal IDs)
        tx.delete(favorites).run();
        tx.delete(meals).run();
        tx.delete(dailySummaries).run();
        // Settings: upsert only — the API key row (absent from backup) stays as-is

        // Restore meals
        if (backup.meals.length > 0) {
            tx.insert(meals)
                .values(
                    backup.meals.map((m) => ({
                        id: m.id,
                        date: m.date,
                        time: m.time,
                        mealType: m.mealType as MealType,
                        mealText: m.mealText,
                        calories: m.calories ?? null,
                        aiAnalysis: m.aiAnalysis ?? null,
                        isStarred: m.isStarred,
                        createdAt: m.createdAt,
                        updatedAt: m.updatedAt,
                    })),
                )
                .run();
        }

        // Restore favorites
        if (backup.favorites.length > 0) {
            tx.insert(favorites)
                .values(
                    backup.favorites.map((f) => ({
                        id: f.id,
                        type: f.type as FavoriteType,
                        name: f.name,
                        mealText: f.mealText,
                        calories: f.calories ?? null,
                        sourceMealId: f.sourceMealId ?? null,
                        createdAt: f.createdAt,
                    })),
                )
                .run();
        }

        // Restore daily summaries
        for (const s of backup.dailySummaries) {
            tx.insert(dailySummaries)
                .values({
                    date: s.date,
                    content: s.content,
                    generatedAt: s.generatedAt,
                })
                .onConflictDoUpdate({
                    target: dailySummaries.date,
                    set: { content: s.content, generatedAt: s.generatedAt },
                })
                .run();
        }

        // Upsert settings from backup (API key not in backup, so it stays)
        for (const [key, value] of Object.entries(backup.settings)) {
            if (EXCLUDED_SETTING_KEYS.includes(key)) continue;
            tx.insert(settings)
                .values({ key, value })
                .onConflictDoUpdate({
                    target: settings.key,
                    set: { value },
                })
                .run();
        }
    });
}
