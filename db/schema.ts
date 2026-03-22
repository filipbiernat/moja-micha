import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Meals ────────────────────────────────────────────────────

export const meals = sqliteTable('meals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),              // YYYY-MM-DD
    time: text('time').notNull(),              // HH:MM
    mealType: text('meal_type').notNull(),     // breakfast | second_breakfast | lunch | afternoon_snack | dinner | snack
    mealText: text('meal_text').notNull(),
    calories: integer('calories'),
    aiAnalysis: text('ai_analysis'),
    isStarred: integer('is_starred').notNull().default(0), // 0 or 1
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Favorites ────────────────────────────────────────────────

export const favorites = sqliteTable('favorites', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type').notNull(),              // 'template' | 'starred'
    name: text('name').notNull(),
    mealText: text('meal_text').notNull(),
    calories: integer('calories'),
    sourceMealId: integer('source_meal_id').references(() => meals.id, { onDelete: 'set null' }),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Settings ─────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
});

// ─── Daily Summaries ─────────────────────────────────────────

export const dailySummaries = sqliteTable('daily_summaries', {
    date: text('date').primaryKey(),
    content: text('content').notNull(),
    generatedAt: integer('generated_at').notNull(),
});

// ─── Inferred Types ───────────────────────────────────────────

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type DailySummary = typeof dailySummaries.$inferSelect;

// ─── Constants ────────────────────────────────────────────────

export type MealType =
    | 'breakfast'
    | 'second_breakfast'
    | 'lunch'
    | 'afternoon_snack'
    | 'dinner'
    | 'snack';

export type FavoriteType = 'template' | 'starred';

export const SETTING_KEYS = {
    THEME: 'theme',
    LANGUAGE: 'language',
    DAILY_CALORIE_GOAL: 'daily_calorie_goal',
    OPENAI_API_KEY: 'openai_api_key',
    OPENAI_MODEL: 'openai_model',
    PROFILE_SEX: 'profile_sex',
    PROFILE_AGE: 'profile_age',
    DIET_GOAL: 'diet_goal',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type UserSex = 'female' | 'male' | 'unspecified';
export type DietGoal = 'fat_loss' | 'maintain' | 'muscle_gain';
