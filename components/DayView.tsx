import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    PanResponder,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useDatabase } from "../db/DatabaseProvider";
import { getMealsByDate, getStreak, setMealStarred } from "../db/meals";
import { toggleStarredMeal } from "../db/favorites";
import type { Meal } from "../db/schema";
import { getSetting } from "../db/settings";
import { SETTING_KEYS } from "../db/schema";
import { useTheme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { SortCycleButton, type SortCycleOption } from "./SortCycleButton";

type MealSortOrder = "newest" | "oldest" | "alpha";

export interface DayViewProps {
    date: string; // YYYY-MM-DD
    onDateChange?: (newDate: string) => void;
    reloadKey?: number;
    onMealPress?: (meal: Meal) => void;
    /** If provided, the date row becomes tappable and shows a chevron toggle. */
    onCalendarToggle?: () => void;
    /** Controls the chevron direction when the calendar is open/closed. */
    calendarExpanded?: boolean;
}

export function DayView({
    date,
    onDateChange,
    reloadKey = 0,
    onMealPress,
    onCalendarToggle,
    calendarExpanded = false,
}: DayViewProps) {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const [meals, setMeals] = useState<Meal[]>([]);
    const [sortOrder, setSortOrder] = useState<MealSortOrder>("newest");
    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
    const [streak, setStreak] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

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
        } finally {
            setIsLoading(false);
        }
    }, [db, date]);

    useEffect(() => {
        loadData();
    }, [loadData, reloadKey]);

    const totalKcal = useMemo(() => {
        return meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    }, [meals]);

    const sortOptions = useMemo<ReadonlyArray<SortCycleOption<MealSortOrder>>>(
        () => [
            {
                value: "newest",
                label: t("sort.newest"),
                icon: "arrow-down-outline",
            },
            {
                value: "oldest",
                label: t("sort.oldest"),
                icon: "arrow-up-outline",
            },
            {
                value: "alpha",
                label: t("sort.alphabetical"),
                icon: "text-outline",
            },
        ],
        [t],
    );

    const sortedMeals = useMemo(() => {
        return [...meals].sort((a, b) => {
            if (sortOrder === "alpha") {
                return a.mealText.localeCompare(b.mealText);
            }

            if (sortOrder === "oldest") {
                return a.time.localeCompare(b.time);
            }

            return b.time.localeCompare(a.time);
        });
    }, [meals, sortOrder]);

    const formatDateEuropean = (dateString: string) => {
        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    const handleStarToggle = useCallback(
        (meal: Meal) => {
            try {
                const newStarred = toggleStarredMeal(
                    db,
                    meal.id,
                    meal.mealText, // name (Meal has no separate name field)
                    meal.mealText,
                    meal.calories,
                );
                setMealStarred(db, meal.id, newStarred);
                loadData();
            } catch (error) {
                console.error("Failed to toggle star:", error);
            }
        },
        [db, loadData],
    );

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

    const renderMeal = ({ item }: { item: Meal }) => (
        <View
            testID={`meal-card-${item.id}`}
            style={[
                styles.mealCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                },
            ]}
        >
            {/* Tappable main body */}
            <TouchableOpacity
                onPress={onMealPress ? () => onMealPress(item) : undefined}
                activeOpacity={onMealPress ? 0.7 : 1}
                accessibilityLabel={item.mealText}
                style={styles.mealBody}
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
                        {item.calories} {t("common.kcal_unit")}
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
            {/* Star button */}
            <TouchableOpacity
                testID={`meal-star-btn-${item.id}`}
                accessibilityLabel={item.isStarred === 1 ? t("dayView.btn_unstar") : t("dayView.btn_star")}
                onPress={() => handleStarToggle(item)}
                style={styles.starBtn}
            >
                <Ionicons
                    name={item.isStarred === 1 ? "star" : "star-outline"}
                    size={20}
                    color={item.isStarred === 1 ? colors.star : colors.textMuted}
                />
            </TouchableOpacity>
        </View>
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

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
                        accessibilityLabel={t("dayView.btn_prev_day")}
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

                {onCalendarToggle ? (
                    <TouchableOpacity
                        onPress={onCalendarToggle}
                        style={styles.dateContainer}
                        activeOpacity={0.7}
                        testID="dayview-calendar-toggle"
                        accessibilityLabel={t("dayView.toggle_calendar")}
                    >
                        <View style={styles.dateRow}>
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
                            <Ionicons
                                name={
                                    calendarExpanded
                                        ? "chevron-up"
                                        : "chevron-down"
                                }
                                size={16}
                                color={colors.primary}
                                style={{ marginLeft: spacing.xs }}
                            />
                        </View>
                        {streak > 0 && (
                            <View
                                style={[
                                    styles.streakBadge,
                                    {
                                        backgroundColor:
                                            colors.surfaceHighlight,
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
                    </TouchableOpacity>
                ) : (
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
                                        backgroundColor:
                                            colors.surfaceHighlight,
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
                )}

                {onDateChange ? (
                    <TouchableOpacity
                        onPress={handleNextDay}
                        style={styles.navButton}
                        accessibilityLabel={t("dayView.btn_next_day")}
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
                    <SortCycleButton
                        testID="dayview-sort-toggle"
                        value={sortOrder}
                        options={sortOptions}
                        onChange={setSortOrder}
                    />
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
    dateRow: {
        flexDirection: "row",
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
    listContent: {
        flexGrow: 1,
    },
    mealCard: {
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "stretch",
    },
    mealBody: {
        flex: 1,
        padding: 16,
    },
    starBtn: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
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
