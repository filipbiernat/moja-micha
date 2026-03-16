import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    PanResponder,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useDatabase } from "../db/DatabaseProvider";
import { getMealsByDate, getStreak } from "../db/meals";
import type { Meal } from "../db/schema";
import { getSetting } from "../db/settings";
import { SETTING_KEYS } from "../db/schema";
import { useTheme } from "../theme";
import { Ionicons } from "@expo/vector-icons";

export interface DayViewProps {
    date: string; // YYYY-MM-DD
    onDateChange?: (newDate: string) => void;
    reloadKey?: number;
    onMealPress?: (meal: Meal) => void;
}

export function DayView({
    date,
    onDateChange,
    reloadKey = 0,
    onMealPress,
}: DayViewProps) {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const [meals, setMeals] = useState<Meal[]>([]);
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // 'desc' = newest first
    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
    const [streak, setStreak] = useState<number>(0);

    const loadData = useCallback(() => {
        try {
            const loadedMeals = getMealsByDate(db, date);
            setMeals(loadedMeals);

            const goalStr = getSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL);
            if (goalStr) {
                const goalNum = parseInt(goalStr, 10);
                setCalorieGoal(isNaN(goalNum) ? null : goalNum);
            } else {
                setCalorieGoal(null);
            }

            const currentStreak = getStreak(db);
            setStreak(currentStreak);
        } catch (error) {
            console.error("Failed to load date info:", error);
        }
    }, [db, date]);

    useEffect(() => {
        loadData();
    }, [loadData, reloadKey]);

    const totalKcal = useMemo(() => {
        return meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    }, [meals]);

    const sortedMeals = useMemo(() => {
        return [...meals].sort((a, b) => {
            if (sortOrder === "desc") {
                return b.time.localeCompare(a.time);
            } else {
                return a.time.localeCompare(b.time);
            }
        });
    }, [meals, sortOrder]);

    const formatDateEuropean = (dateString: string) => {
        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    const handlePrevDay = useCallback(() => {
        if (!onDateChange) return;
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        onDateChange(`${year}-${month}-${day}`);
    }, [date, onDateChange]);

    const handleNextDay = useCallback(() => {
        if (!onDateChange) return;
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        onDateChange(`${year}-${month}-${day}`);
    }, [date, onDateChange]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    return (
                        Math.abs(gestureState.dx) > 20 &&
                        Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
                    );
                },
                onPanResponderRelease: (evt, gestureState) => {
                    if (gestureState.dx > 50) {
                        handlePrevDay();
                    } else if (gestureState.dx < -50) {
                        handleNextDay();
                    }
                },
            }),
        [handlePrevDay, handleNextDay],
    );

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    };

    const renderMeal = ({ item }: { item: Meal }) => (
        <TouchableOpacity
            onPress={onMealPress ? () => onMealPress(item) : undefined}
            activeOpacity={onMealPress ? 0.7 : 1}
            testID={`meal-card-${item.id}`}
            accessibilityLabel={item.mealText}
            style={[
                styles.mealCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                },
            ]}
        >
            <View style={styles.mealHeader}>
                <Text
                    style={{
                        color: colors.primary,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                    }}
                >
                    {t(`mealTypes.${item.mealType}`, {
                        defaultValue: item.mealType,
                    }).toUpperCase()}
                </Text>
                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.xs,
                    }}
                >
                    {item.time}
                </Text>
            </View>
            <Text
                style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.md,
                }}
            >
                {item.mealText}
            </Text>
            {item.calories ? (
                <Text
                    style={{
                        color: colors.secondary,
                        fontSize: typography.fontSize.md,
                        marginTop: spacing.xs,
                        fontWeight: typography.fontWeight.bold,
                    }}
                >
                    {item.calories} kcal
                </Text>
            ) : null}
            {item.aiAnalysis ? (
                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.xs,
                        marginTop: spacing.xs,
                        fontStyle: "italic",
                    }}
                >
                    {item.aiAnalysis}
                </Text>
            ) : null}
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="restaurant-outline"
                size={48}
                color={colors.textDisabled}
                style={{ marginBottom: spacing.md }}
            />
            <Text
                style={[
                    styles.emptyTitle,
                    {
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.bold,
                    },
                ]}
            >
                {t("dayView.empty_state_title")}
            </Text>
            <Text
                style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.md,
                    textAlign: "center",
                }}
            >
                {t("dayView.empty_state_subtitle")}
            </Text>
        </View>
    );

    const progress = calorieGoal ? Math.min(totalKcal / calorieGoal, 1) : 0;
    const progressColor = progress >= 1 ? colors.error : colors.primary;
    const streakText =
        streak === 1
            ? t("dayView.streak", { count: streak })
            : t("dayView.streak_plural", { count: streak });

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
            {...panResponder.panHandlers}
        >
            {/* Header: Date & Nav */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                {onDateChange ? (
                    <TouchableOpacity
                        onPress={handlePrevDay}
                        style={styles.navButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.navButtonPlaceholder} />
                )}

                <View style={styles.dateContainer}>
                    <Text
                        style={[
                            styles.dateText,
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.xxl,
                                fontWeight: typography.fontWeight.bold,
                            },
                        ]}
                    >
                        {formatDateEuropean(date)}
                    </Text>
                    {streak > 0 && (
                        <View
                            style={[
                                styles.streakBadge,
                                {
                                    backgroundColor: colors.surfaceHighlight,
                                    borderRadius: borderRadius.full,
                                    marginTop: spacing.xs,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: colors.streak,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.bold,
                                }}
                            >
                                🔥 {streakText}
                            </Text>
                        </View>
                    )}
                </View>

                {onDateChange ? (
                    <TouchableOpacity
                        onPress={handleNextDay}
                        style={styles.navButton}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.navButtonPlaceholder} />
                )}
            </View>

            {/* Summary */}
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    margin: spacing.md,
                }}
            >
                <View style={styles.summaryHeader}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.md,
                        }}
                    >
                        {t("dayView.kcal_sum")}
                    </Text>
                    <Text
                        style={[
                            styles.summaryValue,
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.xxxl,
                                fontWeight: typography.fontWeight.bold,
                            },
                        ]}
                    >
                        {totalKcal}
                    </Text>
                </View>
                {calorieGoal ? (
                    <View style={styles.goalContainer}>
                        <View
                            style={[
                                styles.progressBarBackground,
                                {
                                    backgroundColor:
                                        colors.progressBarBackground,
                                    borderRadius: borderRadius.sm,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        backgroundColor: progressColor,
                                        width: `${progress * 100}%`,
                                        borderRadius: borderRadius.sm,
                                    },
                                ]}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.xs,
                                marginTop: spacing.xs,
                                textAlign: "right",
                            }}
                        >
                            {t("dayView.kcal_goal", { goal: calorieGoal })}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* List Controls */}
            {meals.length > 0 && (
                <View
                    style={[
                        styles.listControls,
                        { paddingHorizontal: spacing.md },
                    ]}
                >
                    <TouchableOpacity
                        onPress={toggleSort}
                        style={styles.sortButton}
                    >
                        <Ionicons
                            name={
                                sortOrder === "desc"
                                    ? "arrow-down-outline"
                                    : "arrow-up-outline"
                            }
                            size={16}
                            color={colors.primary}
                        />
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: typography.fontSize.xs,
                                marginLeft: spacing.xs,
                            }}
                        >
                            {sortOrder === "desc"
                                ? t("dayView.sort_newest")
                                : t("dayView.sort_oldest")}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Meals List */}
            <FlatList
                data={sortedMeals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMeal}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    { padding: spacing.md, paddingBottom: 100 },
                ]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    navButton: {
        padding: 8,
    },
    navButtonPlaceholder: {
        width: 40,
    },
    dateContainer: {
        alignItems: "center",
    },
    dateText: {
        fontWeight: "bold",
    },
    streakBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    summaryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryValue: {
        fontWeight: "bold",
    },
    goalContainer: {
        marginTop: 4,
    },
    progressBarBackground: {
        height: 8,
        width: "100%",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
    },
    listControls: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    listContent: {
        flexGrow: 1,
    },
    mealCard: {
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    mealHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 64,
    },
    emptyTitle: {
        marginBottom: 8,
    },
});
