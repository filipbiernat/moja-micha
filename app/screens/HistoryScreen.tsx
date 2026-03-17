import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, type DateData } from 'react-native-calendars';
import { DayView } from '../../components/DayView';
import { MealFormSheet, type MealFormSheetHandle } from '../../components/MealFormSheet';
import type { Meal } from '../../db/schema';
import { getDatesWithMeals } from '../../db/meals';
import { useDatabase } from '../../db/DatabaseProvider';
import { useTheme } from '../../theme';
import { getLocalDateString } from '../../utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthRangeForDate(dateStr: string): { start: string; end: string } {
    const [year, month] = dateStr.split('-').map(Number);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    // Use 31 as a safe upper bound — SQLite string compare will still match all days ≤ 31
    const end = `${year}-${String(month).padStart(2, '0')}-31`;
    return { start, end };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const db = useDatabase();

    const [selectedDate, setSelectedDate] = useState(getLocalDateString);
    // Tracks the month currently shown in the Calendar widget (YYYY-MM-DD of 1st of month)
    const [visibleMonthKey, setVisibleMonthKey] = useState(() => {
        const d = getLocalDateString();
        return d.substring(0, 7) + '-01';
    });
    const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean; dotColor: string }>>({});
    const [refreshKey, setRefreshKey] = useState(0);

    const formSheetRef = useRef<MealFormSheetHandle>(null);

    // Reset to today when the tab becomes active
    useFocusEffect(
        useCallback(() => {
            const today = getLocalDateString();
            setSelectedDate(today);
            setVisibleMonthKey(today.substring(0, 7) + '-01');
        }, []),
    );

    // Load marked dates for the currently visible month
    const loadMarkedDates = useCallback(() => {
        try {
            const { start, end } = monthRangeForDate(visibleMonthKey);
            const dates = getDatesWithMeals(db, start, end);
            const marks: Record<string, { marked: boolean; dotColor: string }> = {};
            for (const d of dates) {
                marks[d] = { marked: true, dotColor: colors.primary };
            }
            setMarkedDates(marks);
        } catch (err) {
            console.error('HistoryScreen: failed to load marked dates', err);
        }
    }, [db, visibleMonthKey, colors.primary]);

    useEffect(() => {
        loadMarkedDates();
    }, [loadMarkedDates, refreshKey]);

    // ─── Calendar event handlers ──────────────────────────────────────────────

    const handleDayPress = useCallback((day: DateData) => {
        setSelectedDate(day.dateString);
    }, []);

    // Fired when the user navigates to a different month via calendar arrows
    const handleMonthChange = useCallback((month: DateData) => {
        setVisibleMonthKey(month.dateString.substring(0, 7) + '-01');
    }, []);

    // ─── DayView event handlers ───────────────────────────────────────────────

    const handleDateChange = useCallback((newDate: string) => {
        setSelectedDate(newDate);
        const newMonthKey = newDate.substring(0, 7) + '-01';
        setVisibleMonthKey(newMonthKey);
    }, []);

    const handleMealPress = useCallback((meal: Meal) => {
        formSheetRef.current?.openEdit(meal);
    }, []);

    const handleSaved = useCallback((savedDate: string) => {
        setSelectedDate(savedDate);
        setVisibleMonthKey(savedDate.substring(0, 7) + '-01');
        setRefreshKey((prev) => prev + 1);
    }, []);

    // ─── Calendar theme ───────────────────────────────────────────────────────

    const calendarTheme = useMemo(() => ({
        backgroundColor: colors.surface,
        calendarBackground: colors.surface,
        textSectionTitleColor: colors.textSecondary,
        selectedDayBackgroundColor: colors.primary,
        selectedDayTextColor: colors.textOnAccent,
        todayTextColor: colors.secondary,
        // 'transparent' is intentional — today circle uses only text color accent, not a background fill
        todayBackgroundColor: 'transparent' as const,
        dayTextColor: colors.textPrimary,
        textDisabledColor: colors.textDisabled,
        dotColor: colors.primary,
        selectedDotColor: colors.textOnAccent,
        arrowColor: colors.primary,
        monthTextColor: colors.textPrimary,
        indicatorColor: colors.primary,
        textDayFontSize: typography.fontSize.sm,
        textMonthFontSize: typography.fontSize.md,
        textDayHeaderFontSize: typography.fontSize.xs,
        'stylesheet.calendar.header': {
            week: {
                marginTop: 5,
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
        },
    }), [colors, typography]);

    // Merge selected state into markedDates
    const computedMarkedDates = useMemo(() => ({
        ...markedDates,
        [selectedDate]: {
            ...(markedDates[selectedDate] ?? {}),
            selected: true,
            selectedColor: colors.primary,
        },
    }), [markedDates, selectedDate, colors.primary]);

    return (
        <SafeAreaView
            edges={['top']}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Calendar strip — key forces re-render when month changes due to DayView swipe */}
            <Calendar
                key={visibleMonthKey}
                current={visibleMonthKey}
                onDayPress={handleDayPress}
                onMonthChange={handleMonthChange}
                markedDates={computedMarkedDates}
                theme={calendarTheme}
                enableSwipeMonths
                style={[
                    styles.calendar,
                    {
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        marginHorizontal: spacing.md,
                        marginTop: spacing.sm,
                        marginBottom: spacing.sm,
                    },
                ]}
            />

            {/* Day detail view — fills remaining space; handles swipe between days */}
            <DayView
                date={selectedDate}
                onDateChange={handleDateChange}
                reloadKey={refreshKey}
                onMealPress={handleMealPress}
            />

            {/* Meal form sheet for adding/editing */}
            <MealFormSheet ref={formSheetRef} onSaved={handleSaved} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendar: {
        overflow: 'hidden',
    },
});
