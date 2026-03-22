/**
 * OpenAI API service for meal analysis and daily insights.
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
                    `${langInstruction} Return nothing else — no markdown, no explanation.`,
            },
            {
                role: 'user',
                content: mealText,
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

/**
 * Generate a short daily progress insight based on today's meals vs. calorie goal.
 * @param apiKey  User's OpenAI API key.
 * @param mealsSummary  A multi-line text listing today's meals and their kcal.
 * @param totalKcal  Total kcal logged today.
 * @param goalKcal  Daily calorie goal.
 * @param language  UI language ('pl' | 'en').
 */
export async function getDailyInsight(
    apiKey: string,
    mealsSummary: string,
    totalKcal: number,
    goalKcal: number | null,
    language: string,
    model: string = DEFAULT_OPENAI_MODEL,
): Promise<string> {
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
                    `You are a friendly personal nutrition coach. ` +
                    `Based on the user's meals today and their calorie goal, write a short encouraging insight (2–3 sentences). ` +
                    `Focus on progress towards the goal and optional practical tip. ${langInstruction} ` +
                    `Return plain text only — no JSON, no bullet points, no markdown.`,
            },
            {
                role: 'user',
                content:
                    (goalKcal !== null ? `Daily calorie goal: ${goalKcal} kcal\n` : '') +
                    `Total logged today: ${totalKcal} kcal\n\n` +
                    `Today's meals:\n${mealsSummary}`,
            },
        ],
    );

    return content.trim();
}
