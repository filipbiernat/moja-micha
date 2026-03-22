import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { dailySummaries, type DailySummary } from './schema';

type DB = ExpoSQLiteDatabase;

export function getDailySummary(db: DB, date: string): DailySummary | null {
    return (
        db
            .select()
            .from(dailySummaries)
            .where(eq(dailySummaries.date, date))
            .get() ?? null
    );
}

export function upsertDailySummary(
    db: DB,
    date: string,
    content: string,
): DailySummary {
    return db
        .insert(dailySummaries)
        .values({
            date,
            content,
            generatedAt: Date.now(),
        })
        .onConflictDoUpdate({
            target: dailySummaries.date,
            set: {
                content,
                generatedAt: Date.now(),
            },
        })
        .returning()
        .get();
}

export function deleteDailySummary(db: DB, date: string): void {
    db.delete(dailySummaries).where(eq(dailySummaries.date, date)).run();
}