import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import type { DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useDatabase } from "../../db/DatabaseProvider";
import { getDatesWithMeals } from "../../db/meals";
import { DayView } from "../../components/DayView";
import {
    MealFormSheet,
    type MealFormSheetHandle,
} from "../../components/MealFormSheet";
import type { Meal } from "../../db/schema";
import { useTheme } from "../../theme";
import { getLocalDateString } from "../../utils";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Approximate height of a full calendar month widget in px. */
const CALENDAR_HEIGHT = 380;

/** How many years before/after current to show in the year picker. */
const YEAR_RANGE = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

type PickerMode = "none" | "year" | "month";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthRangeForKey(monthKey: string): { start: string; end: string } {
    const [year, month] = monthKey.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    // '31' is a safe upper bound — SQLite string compare matches all real days
    const end = `${year}-${String(month).padStart(2, "0")}-31`;
    return { start, end };
}

function formatMonthYear(yearMonthKey: string, language: string): string {
    const [y, m] = yearMonthKey.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    const monthName = d.toLocaleDateString(
        language === "pl" ? "pl-PL" : "en-US",
        { month: "long" },
    );
    return `${monthName} ${y}`;
}

function getMonthShort(monthIndex: number, language: string): string {
    const d = new Date(2024, monthIndex, 1);
    return d.toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
        month: "short",
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JournalScreen() {
    const { t, i18n } = useTranslation();
    const { colors, typography, spacing, borderRadius, shadows } = useTheme();
    const db = useDatabase();
    const lang = i18n.language ?? "en";

    // ─── Date & calendar navigation state ─────────────────────────────────────

    const [currentDate, setCurrentDate] = useState(getLocalDateString);
    const [visibleMonthKey, setVisibleMonthKey] = useState(
        () => `${getLocalDateString().substring(0, 7)}-01`,
    );
    const [markedDates, setMarkedDates] = useState<
        Record<string, { marked: boolean; dotColor: string }>
    >({});
    const [refreshKey, setRefreshKey] = useState(0);

    // ─── Calendar expand / collapse ───────────────────────────────────────────

    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const calendarHeightAnim = useRef(new Animated.Value(0)).current;

    const openCalendar = useCallback(() => {
        Animated.timing(calendarHeightAnim, {
            toValue: CALENDAR_HEIGHT,
            duration: 250,
            useNativeDriver: false,
        }).start();
        setCalendarExpanded(true);
    }, [calendarHeightAnim]);

    const closeCalendar = useCallback(() => {
        Animated.timing(calendarHeightAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setCalendarExpanded(false);
    }, [calendarHeightAnim]);

    const toggleCalendar = useCallback(() => {
        setCalendarExpanded((prev) => {
            if (prev) {
                Animated.timing(calendarHeightAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
                return false;
            } else {
                Animated.timing(calendarHeightAnim, {
                    toValue: CALENDAR_HEIGHT,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
                return true;
            }
        });
    }, [calendarHeightAnim]);

    // ─── Year / month picker ───────────────────────────────────────────────────

    const [pickerMode, setPickerMode] = useState<PickerMode>("none");
    const [pickerYear, setPickerYear] = useState(() =>
        new Date().getFullYear(),
    );

    const openYearPicker = useCallback(() => {
        const [y] = visibleMonthKey.split("-").map(Number);
        setPickerYear(y);
        setPickerMode("year");
    }, [visibleMonthKey]);

    const handleYearSelect = useCallback((year: number) => {
        setPickerYear(year);
        setPickerMode("month");
    }, []);

    const handleMonthSelect = useCallback(
        (monthIndex: number /* 0-based */) => {
            const newMonthKey = `${pickerYear}-${String(monthIndex + 1).padStart(2, "0")}-01`;
            setVisibleMonthKey(newMonthKey);
            setPickerMode("none");
        },
        [pickerYear],
    );

    const closePicker = useCallback(() => setPickerMode("none"), []);

    // ─── Meal form sheet ───────────────────────────────────────────────────────

    const formSheetRef = useRef<MealFormSheetHandle>(null);

    const handleOpenAdd = useCallback(() => {
        formSheetRef.current?.openAdd(currentDate);
    }, [currentDate]);

    const handleMealPress = useCallback((meal: Meal) => {
        formSheetRef.current?.openEdit(meal);
    }, []);

    const handleSaved = useCallback((savedDate: string) => {
        setCurrentDate(savedDate);
        setVisibleMonthKey(savedDate.substring(0, 7) + "-01");
        setRefreshKey((prev) => prev + 1);
    }, []);

    // ─── Focus: reset to today ─────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            const today = getLocalDateString();
            setCurrentDate(today);
            setVisibleMonthKey(today.substring(0, 7) + "-01");
            setRefreshKey((prev) => prev + 1);
            closeCalendar();
        }, [closeCalendar]),
    );

    // ─── Marked dates (load per visible month) ────────────────────────────────

    const loadMarkedDates = useCallback(() => {
        try {
            const { start, end } = monthRangeForKey(visibleMonthKey);
            const dates = getDatesWithMeals(db, start, end);
            const marks: Record<string, { marked: boolean; dotColor: string }> =
                {};
            for (const d of dates) {
                marks[d] = { marked: true, dotColor: colors.primary };
            }
            setMarkedDates(marks);
        } catch (err) {
            console.error("JournalScreen: failed to load marked dates", err);
        }
    }, [db, visibleMonthKey, colors.primary]);

    useEffect(() => {
        loadMarkedDates();
    }, [loadMarkedDates, refreshKey]);

    // ─── Calendar event handlers ──────────────────────────────────────────────

    const handleDayPress = useCallback(
        (day: DateData) => {
            setCurrentDate(day.dateString);
            closeCalendar();
        },
        [closeCalendar],
    );

    const handleMonthChange = useCallback((month: DateData) => {
        setVisibleMonthKey(month.dateString.substring(0, 7) + "-01");
    }, []);

    // ─── DayView date change (swipe / arrows) ─────────────────────────────────

    const handleDateChange = useCallback((newDate: string) => {
        setCurrentDate(newDate);
        setVisibleMonthKey(newDate.substring(0, 7) + "-01");
    }, []);

    // ─── Memoised calendar props ──────────────────────────────────────────────

    const calendarTheme = useMemo(
        () => ({
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.textOnAccent,
            todayTextColor: colors.secondary,
            // 'transparent' is intentional: today uses colored text, no fill
            todayBackgroundColor: "transparent" as const,
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
        }),
        [colors, typography],
    );

    const computedMarkedDates = useMemo(
        () => ({
            ...markedDates,
            [currentDate]: {
                ...(markedDates[currentDate] ?? {}),
                selected: true,
                selectedColor: colors.primary,
            },
        }),
        [markedDates, currentDate, colors.primary],
    );

    // ─── Year / month picker data ─────────────────────────────────────────────

    const currentYear = new Date().getFullYear();
    const years = useMemo(
        () =>
            Array.from(
                { length: YEAR_RANGE * 2 + 1 },
                (_, i) => currentYear - YEAR_RANGE + i,
            ),
        [currentYear],
    );

    const months = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) => ({
                index: i,
                label: getMonthShort(i, lang),
            })),
        [lang],
    );

    // ─── Calendar inner header (tappable month/year title) ────────────────────

    const calendarHeaderTitle = useMemo(
        () => (
            <TouchableOpacity
                onPress={openYearPicker}
                style={styles.calendarHeaderTitle}
                testID="journal-calendar-month-header"
            >
                <Text
                    style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.md,
                        fontWeight: typography.fontWeight.bold,
                    }}
                >
                    {formatMonthYear(visibleMonthKey, lang)}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={14}
                    color={colors.primary}
                    style={{ marginLeft: 4 }}
                />
            </TouchableOpacity>
        ),
        [visibleMonthKey, lang, colors, typography, openYearPicker],
    );

    // ─── Picker cell renderers ────────────────────────────────────────────────

    const renderPickerYear = (year: number) => {
        const isSelected = year === pickerYear;
        return (
            <TouchableOpacity
                key={year}
                onPress={() => handleYearSelect(year)}
                style={[
                    styles.pickerCell,
                    isSelected && {
                        backgroundColor: colors.primary,
                        borderRadius: borderRadius.md,
                    },
                ]}
            >
                <Text
                    style={{
                        color: isSelected
                            ? colors.textOnAccent
                            : colors.textPrimary,
                        fontSize: typography.fontSize.md,
                        fontWeight: isSelected
                            ? typography.fontWeight.bold
                            : typography.fontWeight.regular,
                        textAlign: "center",
                    }}
                >
                    {year}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderPickerMonth = (item: { index: number; label: string }) => {
        const [, visM] = visibleMonthKey.split("-").map(Number);
        const isSelected =
            item.index + 1 === visM &&
            pickerYear === new Date(visibleMonthKey).getFullYear();
        return (
            <TouchableOpacity
                key={item.index}
                onPress={() => handleMonthSelect(item.index)}
                style={[
                    styles.pickerCell,
                    isSelected && {
                        backgroundColor: colors.primary,
                        borderRadius: borderRadius.md,
                    },
                ]}
            >
                <Text
                    style={{
                        color: isSelected
                            ? colors.textOnAccent
                            : colors.textPrimary,
                        fontSize: typography.fontSize.md,
                        fontWeight: isSelected
                            ? typography.fontWeight.bold
                            : typography.fontWeight.regular,
                        textAlign: "center",
                    }}
                >
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* ── Collapsible calendar ───────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.calendarContainer,
                    {
                        height: calendarHeightAnim,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        marginHorizontal: spacing.md,
                        marginTop: spacing.sm,
                    },
                ]}
            >
                <Calendar
                    key={visibleMonthKey}
                    current={visibleMonthKey}
                    onDayPress={handleDayPress}
                    onMonthChange={handleMonthChange}
                    markedDates={computedMarkedDates}
                    theme={calendarTheme}
                    enableSwipeMonths
                    customHeaderTitle={calendarHeaderTitle}
                    style={styles.calendar}
                />
            </Animated.View>

            {/* ── DayView (+ overlay when calendar is open) ─────────────── */}
            <View style={styles.dayViewWrapper}>
                <DayView
                    date={currentDate}
                    onDateChange={handleDateChange}
                    reloadKey={refreshKey}
                    onMealPress={handleMealPress}
                    onCalendarToggle={toggleCalendar}
                    calendarExpanded={calendarExpanded}
                />
                {/* Transparent overlay: tap on DayView area closes calendar */}
                {calendarExpanded && (
                    <TouchableWithoutFeedback
                        onPress={closeCalendar}
                        accessible={false}
                    >
                        <View style={StyleSheet.absoluteFillObject} />
                    </TouchableWithoutFeedback>
                )}
            </View>

            {/* ── FAB ───────────────────────────────────────────────────── */}
            <TouchableOpacity
                accessibilityLabel={t("today.quick_entry_open")}
                activeOpacity={0.9}
                onPress={handleOpenAdd}
                testID="journal-quick-entry-fab"
                style={[
                    styles.fab,
                    {
                        backgroundColor: colors.primary,
                        borderRadius: borderRadius.full,
                        bottom: spacing.xxxl,
                        right: spacing.lg,
                        elevation: shadows.lg.elevation,
                    },
                ]}
            >
                <Ionicons name="add" size={28} color={colors.textOnAccent} />
            </TouchableOpacity>

            {/* ── Meal form ─────────────────────────────────────────────── */}
            <MealFormSheet ref={formSheetRef} onSaved={handleSaved} />

            {/* ── Year / Month picker modal ─────────────────────────────── */}
            <Modal
                visible={pickerMode !== "none"}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closePicker}
            >
                <TouchableWithoutFeedback onPress={closePicker}>
                    <View
                        style={[
                            styles.pickerBackdrop,
                            {
                                backgroundColor: "rgba(0,0,0,0.55)",
                                padding: spacing.md * 2,
                            },
                        ]}
                    >
                        {/* Inner TouchableWithoutFeedback prevents the backdrop tap
                            from propagating through the card */}
                        <TouchableWithoutFeedback>
                            <View
                                style={[
                                    styles.pickerCard,
                                    {
                                        backgroundColor: colors.surfaceElevated,
                                        borderRadius: borderRadius.xl,
                                        padding: spacing.md,
                                    },
                                ]}
                            >
                                {/* Header row */}
                                <View
                                    style={[
                                        styles.pickerHeader,
                                        { marginBottom: spacing.md },
                                    ]}
                                >
                                    {pickerMode === "month" ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                setPickerMode("year")
                                            }
                                            style={styles.pickerBackBtn}
                                        >
                                            <Ionicons
                                                name="chevron-back"
                                                size={18}
                                                color={colors.primary}
                                            />
                                            <Text
                                                style={{
                                                    color: colors.primary,
                                                    fontSize:
                                                        typography.fontSize.sm,
                                                    marginLeft: 2,
                                                }}
                                            >
                                                {pickerYear}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.pickerBackBtn} />
                                    )}
                                    <TouchableOpacity onPress={closePicker}>
                                        <Ionicons
                                            name="close"
                                            size={22}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Year grid */}
                                {pickerMode === "year" && (
                                    <View style={styles.pickerGrid}>
                                        {years.map(renderPickerYear)}
                                    </View>
                                )}

                                {/* Month grid */}
                                {pickerMode === "month" && (
                                    <View style={styles.pickerGrid}>
                                        {months.map(renderPickerMonth)}
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendarContainer: {
        overflow: "hidden",
    },
    calendar: {
        overflow: "hidden",
    },
    calendarHeaderTitle: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4, // spacing.xs
        paddingHorizontal: 8, // spacing.sm
    },
    dayViewWrapper: {
        flex: 1,
    },
    fab: {
        alignItems: "center",
        height: 56,
        justifyContent: "center",
        position: "absolute",
        width: 56,
    },
    pickerBackdrop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    pickerCard: {
        width: "100%",
        maxWidth: 340,
    },
    pickerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pickerBackBtn: {
        flexDirection: "row",
        alignItems: "center",
        minWidth: 60,
    },
    pickerGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    pickerCell: {
        width: "25%",
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});
