import type { MealAnalysis } from '../services/openai';

export interface ParsedMealAnalysisValue {
    analysis: string | null;
    calories: number | null;
    ingredients: MealAnalysis['ingredients'];
    isStructured: boolean;
    rawValue: string | null;
}

function normalizeCalories(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.round(value))
        : null;
}

function normalizeIngredients(value: unknown): MealAnalysis['ingredients'] {
    if (!Array.isArray(value)) {
        return null;
    }

    const normalized = value
        .map((ingredient) => {
            if (!ingredient || typeof ingredient !== 'object') {
                return null;
            }

            const candidate = ingredient as {
                name?: unknown;
                calories?: unknown;
            };
            const name =
                typeof candidate.name === 'string' ? candidate.name.trim() : '';
            const calories = normalizeCalories(candidate.calories);

            if (!name || calories === null) {
                return null;
            }

            return { name, calories };
        })
        .filter(
            (ingredient): ingredient is NonNullable<MealAnalysis['ingredients']>[number] =>
                ingredient !== null,
        );

    return normalized.length > 0 ? normalized : null;
}

export function parseMealAnalysisValue(
    value: string | null | undefined,
): ParsedMealAnalysisValue {
    const trimmed = value?.trim();

    if (!trimmed) {
        return {
            analysis: null,
            calories: null,
            ingredients: null,
            isStructured: false,
            rawValue: null,
        };
    }

    try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const hasKnownKeys =
            Object.prototype.hasOwnProperty.call(parsed, 'analysis') ||
            Object.prototype.hasOwnProperty.call(parsed, 'calories') ||
            Object.prototype.hasOwnProperty.call(parsed, 'ingredients');

        if (hasKnownKeys) {
            const analysis =
                typeof parsed.analysis === 'string' && parsed.analysis.trim() !== ''
                    ? parsed.analysis.trim()
                    : null;

            return {
                analysis,
                calories: normalizeCalories(parsed.calories),
                ingredients: normalizeIngredients(parsed.ingredients),
                isStructured: true,
                rawValue: trimmed,
            };
        }
    } catch {
        // Legacy plain-text notes are expected here.
    }

    return {
        analysis: trimmed,
        calories: null,
        ingredients: null,
        isStructured: false,
        rawValue: trimmed,
    };
}

export function serializeMealAnalysisValue(analysis: MealAnalysis): string | null {
    const normalizedAnalysis =
        typeof analysis.analysis === 'string' && analysis.analysis.trim() !== ''
            ? analysis.analysis.trim()
            : null;
    const normalizedCalories = normalizeCalories(analysis.calories);
    const normalizedIngredients = normalizeIngredients(analysis.ingredients);

    if (normalizedIngredients === null && normalizedCalories === null) {
        return normalizedAnalysis;
    }

    return JSON.stringify({
        analysis: normalizedAnalysis,
        calories: normalizedCalories,
        ingredients: normalizedIngredients,
    });
}