/**
 * OpenAI API service for meal analysis and stored daily summaries.
 * Uses the Chat Completions API with fetch() directly (no SDK dependency).
 */

const CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 30_000;

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MealAnalysisIngredient {
    name: string;
    calories: number;
}

export interface MealAnalysis {
    calories: number | null;
    analysis: string | null;
    ingredients: MealAnalysisIngredient[] | null;
}

export interface DailySummaryMealInput {
    mealType: string;
    mealText: string;
    time: string;
    calories: number | null;
}

export interface DailySummaryUserProfile {
    sex: 'female' | 'male' | 'unspecified';
    age: number | null;
    dietGoal: 'fat_loss' | 'maintain' | 'muscle_gain';
}

export interface DailySummaryInput {
    date: string;
    meals: DailySummaryMealInput[];
    totalKcal: number;
    calorieGoal: number | null;
    caloriesAvailable: boolean;
    averageCaloriesLast7Days: number | null;
    userProfile: DailySummaryUserProfile;
}

interface DailySummarySectionTitles {
    positive: string;
    improve: string;
    tip: string;
}

function parseCalories(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.round(value))
        : null;
}

function parseIngredients(value: unknown): MealAnalysisIngredient[] | null {
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
            const calories = parseCalories(candidate.calories);

            if (!name || calories === null) {
                return null;
            }

            return { name, calories };
        })
        .filter(
            (ingredient): ingredient is MealAnalysisIngredient => ingredient !== null,
        );

    return normalized.length > 0 ? normalized : null;
}

function formatDietGoal(goal: DailySummaryUserProfile['dietGoal']): string {
    switch (goal) {
        case 'fat_loss':
            return 'fat loss';
        case 'muscle_gain':
            return 'muscle gain';
        default:
            return 'weight maintenance';
    }
}

function formatSex(sex: DailySummaryUserProfile['sex']): string {
    switch (sex) {
        case 'female':
            return 'female';
        case 'male':
            return 'male';
        default:
            return 'unspecified';
    }
}

function getDailySummarySectionTitles(language: string): DailySummarySectionTitles {
    if (language === 'pl') {
        return {
            positive: 'Co poszło dobrze',
            improve: 'Co poprawić',
            tip: 'Jedna konkretna wskazówka na jutro',
        };
    }

    return {
        positive: 'What went well',
        improve: 'What to improve',
        tip: 'One concrete tip for tomorrow',
    };
}

function normalizeDailySummaryHeadings(content: string, language: string): string {
    const titles = getDailySummarySectionTitles(language);

    return content
        .replace(/^#{1,6}\s*What went well\s*$/gim, `## ${titles.positive}`)
        .replace(/^#{1,6}\s*What to improve\s*$/gim, `## ${titles.improve}`)
        .replace(
            /^#{1,6}\s*One concrete tip for tomorrow\s*$/gim,
            `## ${titles.tip}`,
        )
        .replace(/^#{1,6}\s*Co poszło dobrze\s*$/gim, `## ${titles.positive}`)
        .replace(/^#{1,6}\s*Co poszlo dobrze\s*$/gim, `## ${titles.positive}`)
        .replace(/^#{1,6}\s*Co poprawić\s*$/gim, `## ${titles.improve}`)
        .replace(/^#{1,6}\s*Co poprawic\s*$/gim, `## ${titles.improve}`)
        .replace(
            /^#{1,6}\s*Jedna konkretna wskazówka na jutro\s*$/gim,
            `## ${titles.tip}`,
        )
        .replace(
            /^#{1,6}\s*Jedna konkretna wskazowka na jutro\s*$/gim,
            `## ${titles.tip}`,
        );
}

// ─── Internal fetch helper ─────────────────────────────────────────────────

async function callOpenAI(
    apiKey: string,
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    responseFormat?: { type: 'json_object' | 'text' },
): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(CHAT_COMPLETIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                ...(responseFormat ? { response_format: responseFormat } : {}),
            }),
            signal: controller.signal,
        });
    } catch (err: unknown) {
        const isAbort =
            err instanceof Error && err.name === 'AbortError';
        throw new Error(isAbort ? 'timeout' : 'network_error');
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        let code = `http_${response.status}`;
        try {
            const body = await response.json() as { error?: { code?: string } };
            if (body?.error?.code) {
                code = body.error.code;
            }
        } catch {
            // ignore JSON parse failure
        }
        throw new Error(code);
    }

    const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('empty_response');
    }
    return content;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Estimate calories and generate a short nutritional note for a meal.
 * @param apiKey  User's OpenAI API key.
 * @param mealText  Free-text meal description entered by the user.
 * @param language  UI language ('pl' | 'en') — analysis will match this language.
 */
export async function analyzeMeal(
    apiKey: string,
    mealText: string,
    language: string,
    model: string = DEFAULT_OPENAI_MODEL,
    mealComment?: string | null,
): Promise<MealAnalysis> {
    const langInstruction =
        language === 'pl'
            ? 'Odpowiedz w języku polskim.'
            : 'Reply in English.';

    const content = await callOpenAI(
        apiKey,
        model,
        [
            {
                role: 'system',
                content:
                    `You are a nutrition expert. Analyze the meal description and return ONLY a JSON object with exactly three fields: ` +
                    `"ingredients" (an array of objects with "name" and "calories", or null if you cannot break the meal down reliably), ` +
                    `"calories" (integer, estimated total kcal, ideally matching the ingredient sum, or null if you cannot reliably estimate), and ` +
                    `"analysis" (string, a concise 1–2 sentence nutritional note, or null). ` +
                    `${langInstruction} The ingredient names and the analysis text must be written in the requested language. Return nothing else — no markdown, no explanation.`,
            },
            {
                role: 'user',
                content: mealComment && mealComment.trim()
                    ? `${mealText}\n\nAdditional details: ${mealComment.trim()}`
                    : mealText,
            },
        ],
        { type: 'json_object' },
    );

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
        throw new Error('json_parse_error');
    }
    const calories =
        parseCalories(parsed.calories);
    const analysis =
        typeof parsed.analysis === 'string' && parsed.analysis.trim() !== ''
            ? parsed.analysis.trim()
            : null;
    const ingredients = parseIngredients(parsed.ingredients);

    return { calories, analysis, ingredients };
}

export async function getDailySummary(
    apiKey: string,
    input: DailySummaryInput,
    language: string,
    model: string = DEFAULT_OPENAI_MODEL,
): Promise<string> {
    const titles = getDailySummarySectionTitles(language);
    const langInstruction =
        language === 'pl'
            ? 'Odpowiedz w języku polskim.'
            : 'Reply in English.';

    const mealsSummary = input.meals
        .map((meal, index) => {
            const baseLine = `${index + 1}. ${meal.time} | ${meal.mealType} | ${meal.mealText}`;

            if (!input.caloriesAvailable) {
                return baseLine;
            }

            return `${baseLine} | ${meal.calories !== null ? `${meal.calories} kcal` : 'kcal missing'}`;
        })
        .join('\n');

    const calorieDelta =
        input.calorieGoal !== null ? input.totalKcal - input.calorieGoal : null;
    const latestMealTime =
        input.meals.length > 0 ? input.meals[input.meals.length - 1]?.time ?? null : null;
    const quantitativeContext = input.caloriesAvailable
        ?
              `Total logged kcal: ${input.totalKcal}\n` +
              `Daily calorie goal: ${input.calorieGoal !== null ? `${input.calorieGoal} kcal` : 'not set'}\n` +
              `Calorie delta vs goal: ${calorieDelta !== null ? `${calorieDelta} kcal` : 'unknown'}\n` +
              `Average calories from previous 7 days: ${input.averageCaloriesLast7Days !== null ? `${input.averageCaloriesLast7Days} kcal` : 'unknown'}\n`
        :
              `Calorie data completeness: incomplete because at least one meal is missing calories\n` +
              `Quantitative calorie assessment: unavailable for this day\n`;

    const content = await callOpenAI(
        apiKey,
        model,
        [
            {
                role: 'system',
                content:
                    `You are a professional dietitian writing a concise daily nutrition summary. ` +
                    `This is a snapshot of currently logged meals for the selected day, not automatically the final end-of-day result. ` +
                    `Be direct, motivating, and practical. ` +
                    `Return Markdown only. ` +
                    `Always include exactly these three top-level sections in this order: ` +
                    `## ${titles.positive}, ## ${titles.improve}, ## ${titles.tip}. ` +
                    `Inside each section, use short bullet points or 1-2 compact paragraphs for quick scanning. ` +
                    `If calories are available, include a quantitative assessment against the daily goal and mention surplus or deficit when justified. ` +
                    `If calories are not available, skip quantitative judgments and focus on qualitative assessment only. ` +
                    `If only a few meals are logged or the latest logged meal is early, do not write as if the day is already finished. ` +
                    `Avoid phrases that imply the user is done eating for the day unless that clearly follows from the log. ` +
                    `When the log is partial, explicitly frame the feedback as based on what has been logged so far. ` +
                    `Always assess meal regularity, variety, and overall composition. ` +
                    `Do not mention that you are an AI model. ${langInstruction}`,
            },
            {
                role: 'user',
                content:
                    `Date: ${input.date}\n` +
                    `Calories available: ${input.caloriesAvailable ? 'true' : 'false'}\n` +
                    `Meals count: ${input.meals.length}\n` +
                    `Latest logged meal time: ${latestMealTime ?? 'unknown'}\n` +
                    `Meal times: ${input.meals.map((meal) => meal.time).join(', ') || 'none'}\n` +
                    quantitativeContext +
                    `User profile: sex=${formatSex(input.userProfile.sex)}, age=${input.userProfile.age ?? 'unknown'}, goal=${formatDietGoal(input.userProfile.dietGoal)}\n\n` +
                    `Meals:\n${mealsSummary}`,
            },
        ],
    );

    return normalizeDailySummaryHeadings(content.trim(), language);
}
