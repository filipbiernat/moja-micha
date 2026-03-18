import React, { useState, useMemo, useCallback } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Svg, { Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useDatabase } from "../../db/DatabaseProvider";
import { getCalorieSummary, getRecordStreak, getStreak } from "../../db/meals";
import { useTheme } from "../../theme";
import type { ColorTokens } from "../../theme/colors";
import { borderRadius, spacing, typography } from "../../theme/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d";

interface DayData {
    date: string;
    calories: number;
    hasData: boolean;
}

// ─── Chart constants ──────────────────────────────────────────────────────────

const Y_AXIS_WIDTH = 36;
const CHART_RIGHT_PAD = 8;
const BAR_AREA_H = 160;
const LABEL_AREA_H = 28;
const CHART_H = BAR_AREA_H + LABEL_AREA_H;

/** Bar + gap dimensions for the fixed-width 30-day scrollable view. */
const BAR_W_30 = 18;
const GAP_30 = 7;
const STEP_30 = BAR_W_30 + GAP_30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDateRange(days: number): string[] {
    const result: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        result.push(`${y}-${m}-${day}`);
    }
    return result;
}

function computeMovingAverage(
    calories: number[],
    windowSize: number,
): (number | null)[] {
    return calories.map((_, i) => {
        const start = Math.max(0, i - windowSize + 1);
        const slice = calories.slice(start, i + 1).filter((v) => v > 0);
        if (slice.length === 0) return null;
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
}

function getLocalToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ─── CalorieChart ─────────────────────────────────────────────────────────────

interface CalorieChartProps {
    data: DayData[];
    period: Period;
    colors: ColorTokens;
    availableWidth: number;
    language: string;
}

function CalorieChart({
    data,
    period,
    colors,
    availableWidth,
    language,
}: CalorieChartProps): React.ReactElement {
    const is7d = period === "7d";
    const today = getLocalToday();

    // Bar geometry
    const freeW = availableWidth - Y_AXIS_WIDTH - CHART_RIGHT_PAD;
    const step7 = freeW / data.length;
    const barW7 = step7 * 0.62;
    const barOff7 = (step7 - barW7) / 2;

    const step = is7d ? step7 : STEP_30;
    const barW = is7d ? barW7 : BAR_W_30;
    const barOff = is7d ? barOff7 : (STEP_30 - BAR_W_30) / 2;
    const totalBarsW = data.length * step;
    const chartWidth = is7d
        ? availableWidth
        : Y_AXIS_WIDTH + totalBarsW + CHART_RIGHT_PAD;

    // Y scale — round up to nearest 500, minimum 500
    const maxCal = Math.max(...data.map((d) => d.calories), 500);
    const yMax = Math.ceil(maxCal / 500) * 500;

    const toBarY = (cal: number): number =>
        BAR_AREA_H - Math.max(2, (cal / yMax) * BAR_AREA_H);
    const toLineY = (cal: number): number =>
        BAR_AREA_H - (cal / yMax) * BAR_AREA_H;

    // Grid lines — 4 horizontal reference lines
    const gridCount = 4;
    const gridStep = yMax / gridCount;
    const gridLines = Array.from(
        { length: gridCount + 1 },
        (_, i) => i * gridStep,
    );

    // Moving average — compute values then group into gap-free runs
    const maWindow = is7d ? 3 : 7;
    const maValues = computeMovingAverage(
        data.map((d) => d.calories),
        maWindow,
    );

    // Split MA into consecutive non-null runs to avoid bridging over data gaps
    const maRuns: string[][] = [];
    let currentRun: string[] = [];
    maValues.forEach((v, i) => {
        if (v === null) {
            if (currentRun.length >= 2) maRuns.push(currentRun);
            currentRun = [];
        } else {
            const x = Y_AXIS_WIDTH + i * step + step / 2;
            const y = toLineY(v);
            currentRun.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
    });
    if (currentRun.length >= 2) maRuns.push(currentRun);

    // Date labels
    const locale = language === "pl" ? "pl-PL" : "en-US";
    const getLabel = (dateStr: string, idx: number): string => {
        const d = new Date(dateStr + "T00:00:00");
        if (is7d) {
            return d
                .toLocaleDateString(locale, { weekday: "short" })
                .slice(0, 2);
        }
        // 30d: show day number every 5 bars + first + last
        if (idx === 0 || idx === data.length - 1 || idx % 5 === 0) {
            return String(d.getDate());
        }
        return "";
    };

    const svgEl = (
        <Svg width={chartWidth} height={CHART_H}>
            {/* X-axis baseline */}
            <Line
                x1={Y_AXIS_WIDTH}
                y1={BAR_AREA_H}
                x2={chartWidth - CHART_RIGHT_PAD}
                y2={BAR_AREA_H}
                stroke={colors.border}
                strokeWidth={1}
            />

            {/* Horizontal grid lines + Y labels */}
            {gridLines.map((cal) => {
                const y = toLineY(cal);
                const label =
                    cal === 0
                        ? ""
                        : cal >= 1000
                          ? `${(cal / 1000).toFixed(1)}k`
                          : String(cal);
                return (
                    <React.Fragment key={`grid-${cal}`}>
                        <Line
                            x1={Y_AXIS_WIDTH}
                            y1={y}
                            x2={chartWidth - CHART_RIGHT_PAD}
                            y2={y}
                            stroke={colors.divider}
                            strokeWidth={1}
                            strokeDasharray={cal === 0 ? undefined : "3,4"}
                        />
                        {label ? (
                            <SvgText
                                x={Y_AXIS_WIDTH - 4}
                                y={y + 4}
                                textAnchor="end"
                                fontSize={9}
                                fill={colors.textMuted}
                            >
                                {label}
                            </SvgText>
                        ) : null}
                    </React.Fragment>
                );
            })}

            {/* Bars */}
            {data.map((item, i) => {
                const x = Y_AXIS_WIDTH + i * step + barOff;
                const isToday = item.date === today;
                const hasCalories = item.hasData && item.calories > 0;
                const barHeight = hasCalories
                    ? Math.max(2, (item.calories / yMax) * BAR_AREA_H)
                    : 2;
                const y = BAR_AREA_H - barHeight;
                const fill = hasCalories
                    ? isToday
                        ? colors.secondary
                        : colors.primary
                    : colors.divider;
                return (
                    <Rect
                        key={item.date}
                        x={x}
                        y={y}
                        width={barW}
                        height={barHeight}
                        fill={fill}
                        rx={3}
                        opacity={hasCalories ? 1 : 0.5}
                    />
                );
            })}

            {/* Moving average trend line — rendered as per-run segments */}
            {maRuns.map((run, idx) => (
                <Polyline
                    key={`ma-run-${idx}`}
                    points={run.join(" ")}
                    fill="none"
                    stroke={colors.warning}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                />
            ))}

            {/* Date labels below X axis */}
            {data.map((item, i) => {
                const label = getLabel(item.date, i);
                if (!label) return null;
                const x = Y_AXIS_WIDTH + i * step + step / 2;
                const isToday = item.date === today;
                return (
                    <SvgText
                        key={`lbl-${item.date}`}
                        x={x}
                        y={BAR_AREA_H + 17}
                        textAnchor="middle"
                        fontSize={10}
                        fill={isToday ? colors.primary : colors.textMuted}
                        fontWeight={isToday ? "700" : "400"}
                    >
                        {label}
                    </SvgText>
                );
            })}
        </Svg>
    );

    if (!is7d) {
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {svgEl}
            </ScrollView>
        );
    }
    return svgEl;
}

// ─── StatsScreen ──────────────────────────────────────────────────────────────

export default function StatsScreen(): React.ReactElement {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const db = useDatabase();
    const { width: screenWidth } = useWindowDimensions();
    const lang = i18n.language ?? "en";

    const [period, setPeriod] = useState<Period>("7d");
    const [rawSummary, setRawSummary] = useState<
        { date: string; totalCalories: number }[]
    >([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [recordStreak, setRecordStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(
        (activePeriod: Period) => {
            try {
                const days = activePeriod === "7d" ? 7 : 30;
                const today = getLocalToday();
                const startD = new Date();
                startD.setDate(startD.getDate() - (days - 1));
                const sy = startD.getFullYear();
                const sm = String(startD.getMonth() + 1).padStart(2, "0");
                const sd = String(startD.getDate()).padStart(2, "0");
                const startDate = `${sy}-${sm}-${sd}`;

                setRawSummary(getCalorieSummary(db, startDate, today));
                setCurrentStreak(getStreak(db));
                setRecordStreak(getRecordStreak(db));
            } catch (error) {
                console.error("StatsScreen: failed to load data", error);
            } finally {
                setIsLoading(false);
            }
        },
        [db],
    );

    useFocusEffect(
        useCallback(() => {
            loadData(period);
        }, [loadData, period]),
    );

    const handlePeriodChange = useCallback(
        (p: Period) => {
            setPeriod(p);
            loadData(p);
        },
        [loadData],
    );

    // Build chart data — full date range, fill missing days with 0 / no-data
    const chartData: DayData[] = useMemo(() => {
        const days = period === "7d" ? 7 : 30;
        const range = buildDateRange(days);
        const calorieMap = new Map(
            rawSummary.map((s) => [s.date, s.totalCalories]),
        );
        return range.map((date) => ({
            date,
            calories: calorieMap.get(date) ?? 0,
            hasData: calorieMap.has(date),
        }));
    }, [rawSummary, period]);

    const daysWithCalories = chartData.filter(
        (d) => d.hasData && d.calories > 0,
    );
    const hasData = daysWithCalories.length > 0;

    const avgCalories = hasData
        ? Math.round(
              daysWithCalories.reduce((s, d) => s + d.calories, 0) /
                  daysWithCalories.length,
          )
        : 0;
    const maxCalories = hasData
        ? Math.max(...daysWithCalories.map((d) => d.calories))
        : 0;
    const minCalories = hasData
        ? Math.min(...daysWithCalories.map((d) => d.calories))
        : 0;

    const streakLabel = (count: number): string =>
        t("stats.streak_days", { count }) as string;

    const styles = makeStyles(colors);
    const chartAvailableWidth = screenWidth - spacing.lg * 2;

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={styles.header}>{t("stats.title")}</Text>

            {/* Period toggle */}
            <View style={styles.toggleRow} testID="stats-period-toggle">
                {(["7d", "30d"] as Period[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[
                            styles.toggleBtn,
                            period === p && styles.toggleBtnActive,
                        ]}
                        onPress={() => handlePeriodChange(p)}
                        accessibilityRole="button"
                        accessibilityLabel={t(`stats.period_${p}` as const)}
                        accessibilityState={{ selected: period === p }}
                        testID={`stats-period-${p}`}
                    >
                        <Text
                            style={[
                                styles.toggleBtnText,
                                period === p && styles.toggleBtnTextActive,
                            ]}
                        >
                            {t(`stats.period_${p}` as const)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart section */}
            <Text style={styles.sectionLabel}>{t("stats.section_chart")}</Text>
            <View style={styles.chartCard} testID="stats-chart-container">
                {hasData ? (
                    <CalorieChart
                        data={chartData}
                        period={period}
                        colors={colors}
                        availableWidth={chartAvailableWidth}
                        language={lang}
                    />
                ) : (
                    <View
                        style={styles.emptyChartState}
                        testID="stats-empty-state"
                    >
                        <Text style={styles.emptyTitle}>
                            {t("stats.no_data_title")}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {t("stats.no_data_subtitle")}
                        </Text>
                    </View>
                )}
            </View>

            {/* Summary section */}
            <Text style={styles.sectionLabel}>
                {t("stats.section_summary")}
            </Text>
            <View style={styles.summaryRow} testID="stats-summary-row">
                {[
                    { labelKey: "stats.avg", value: avgCalories },
                    { labelKey: "stats.max", value: maxCalories },
                    { labelKey: "stats.min", value: minCalories },
                ].map(({ labelKey, value }) => (
                    <View key={labelKey} style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>
                            {t(labelKey as Parameters<typeof t>[0])}
                        </Text>
                        <Text style={styles.summaryValue}>
                            {hasData ? value.toLocaleString() : "—"}
                        </Text>
                        {hasData && (
                            <Text style={styles.summaryUnit}>
                                {t("stats.kcal_unit")}
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Streak section */}
            <Text style={styles.sectionLabel}>{t("stats.section_streak")}</Text>
            <View style={styles.streakRow} testID="stats-streak-row">
                <View style={styles.streakCard} testID="stats-streak-current">
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakValue}>
                        {streakLabel(currentStreak)}
                    </Text>
                    <Text style={styles.streakLabel}>
                        {t("stats.streak_current")}
                    </Text>
                </View>
                <View style={styles.streakCard} testID="stats-streak-record">
                    <Text style={styles.streakEmoji}>🏆</Text>
                    <Text style={styles.streakValue}>
                        {streakLabel(recordStreak)}
                    </Text>
                    <Text style={styles.streakLabel}>
                        {t("stats.streak_record")}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ColorTokens) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            alignItems: "center",
            justifyContent: "center",
        },
        content: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.huge,
        },
        header: {
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
        },
        // Period toggle
        toggleRow: {
            flexDirection: "row",
            backgroundColor: colors.surfaceElevated,
            borderRadius: borderRadius.lg,
            padding: 3,
            marginBottom: spacing.xl,
        },
        toggleBtn: {
            flex: 1,
            paddingVertical: spacing.sm,
            alignItems: "center",
            borderRadius: borderRadius.md,
        },
        toggleBtnActive: {
            backgroundColor: colors.primary,
        },
        toggleBtnText: {
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semiBold,
            color: colors.textMuted,
        },
        toggleBtnTextActive: {
            color: colors.textOnAccent,
        },
        // Section labels
        sectionLabel: {
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semiBold,
            color: colors.textMuted,
            letterSpacing: 0.8,
            marginBottom: spacing.sm,
            marginTop: spacing.md,
        },
        // Chart
        chartCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            minHeight: CHART_H + spacing.md * 2,
            justifyContent: "center",
        },
        emptyChartState: {
            alignItems: "center",
            paddingVertical: spacing.xl,
        },
        emptyTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semiBold,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
        },
        emptySubtitle: {
            fontSize: typography.fontSize.sm,
            color: colors.textMuted,
            textAlign: "center",
            lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        },
        // Summary
        summaryRow: {
            flexDirection: "row",
            gap: spacing.sm,
            marginBottom: spacing.md,
        },
        summaryCard: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            alignItems: "center",
        },
        summaryLabel: {
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semiBold,
            color: colors.textMuted,
            letterSpacing: 0.5,
            marginBottom: spacing.xs,
        },
        summaryValue: {
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
        },
        summaryUnit: {
            fontSize: typography.fontSize.xs,
            color: colors.textMuted,
            marginTop: 2,
        },
        // Streaks
        streakRow: {
            flexDirection: "row",
            gap: spacing.sm,
            marginBottom: spacing.md,
        },
        streakCard: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: "center",
        },
        streakEmoji: {
            fontSize: 28,
            marginBottom: spacing.xs,
        },
        streakValue: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.streak,
        },
        streakLabel: {
            fontSize: typography.fontSize.xs,
            color: colors.textMuted,
            marginTop: spacing.xs,
            textAlign: "center",
        },
    });
}

