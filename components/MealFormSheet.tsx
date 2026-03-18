import BottomSheet, {
    BottomSheetScrollView,
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Alert,
    Modal,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "../db/DatabaseProvider";
import { getFavoritesByType } from "../db/favorites";
import { createMeal, deleteMeal, getRecentUniqueMeals, updateMeal } from "../db/meals";
import type { Favorite, Meal, MealType } from "../db/schema";
import { useTheme } from "../theme";
import {
    getMealTypeForCurrentTime,
    getLocalDateString,
    getLocalTimeString,
} from "../utils";

// ─── Public handle ────────────────────────────────────────────────────────────

export interface MealFormSheetHandle {
    openAdd: (defaultDate?: string) => void;
    openEdit: (meal: Meal) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MealFormSheetProps {
    /** Called after a successful save, with the date the meal was saved to. */
    onSaved: (date: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_TYPES: MealType[] = [
    "breakfast",
    "second_breakfast",
    "lunch",
    "afternoon_snack",
    "dinner",
    "snack",
];

const SNAP_QUICK = 0; // 50% — quick entry
const SNAP_FULL = 1; // 92% — full form

// ─── Component ────────────────────────────────────────────────────────────────

export const MealFormSheet = forwardRef<
    MealFormSheetHandle,
    MealFormSheetProps
>(({ onSaved }, ref) => {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%", "92%"], []);

    // ── Form identity ────────────────────────────────────────────────────────
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [editMealId, setEditMealId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // ── Field state ──────────────────────────────────────────────────────────
    const [mealText, setMealText] = useState("");
    const [mealType, setMealType] = useState<MealType>("snack");
    const [selectedDate, setSelectedDate] = useState(getLocalDateString);
    const [selectedTime, setSelectedTime] = useState(getLocalTimeString);
    const [calories, setCalories] = useState("");
    const [notes, setNotes] = useState("");

    // ── UI state ─────────────────────────────────────────────────────────────
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [favoritesSections, setFavoritesSections] = useState<
        Array<{ title: string; data: Favorite[] }>
    >([]);
    const [showFavoritesPicker, setShowFavoritesPicker] = useState(false);
    const [recentSuggestions, setRecentSuggestions] = useState<string[]>([]);

    // ── Computed suggestions ─────────────────────────────────────────────────
    const filteredSuggestions = useMemo(() => {
        const query = mealText.trim().toLowerCase();
        if (!query) return recentSuggestions;
        return recentSuggestions.filter((s) =>
            s.toLowerCase().includes(query),
        );
    }, [recentSuggestions, mealText]);
    // ── Reset helper ─────────────────────────────────────────────────────────

    const resetForAdd = useCallback(
        (date: string) => {
            const now = new Date();
            setMode("add");
            setEditMealId(null);
            setMealText("");
            setMealType(getMealTypeForCurrentTime(now));
            setSelectedDate(date);
            setSelectedTime(getLocalTimeString());
            setCalories("");
            setNotes("");
            setValidationError(null);
            setShowDatePicker(false);
            setShowTimePicker(false);
            setRecentSuggestions(getRecentUniqueMeals(db, 10));
        },
        [db],
    );

    // ── Imperative handle ────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
        openAdd: (defaultDate) => {
            resetForAdd(defaultDate ?? getLocalDateString());
            setIsExpanded(false);
            bottomSheetRef.current?.snapToIndex(SNAP_QUICK);
        },
        openEdit: (meal) => {
            setMode("edit");
            setEditMealId(meal.id);
            setMealText(meal.mealText);
            setMealType(meal.mealType as MealType);
            setSelectedDate(meal.date);
            setSelectedTime(meal.time);
            setCalories(meal.calories?.toString() ?? "");
            setNotes(meal.aiAnalysis ?? "");
            setValidationError(null);
            setShowDatePicker(false);
            setShowTimePicker(false);
            setRecentSuggestions(getRecentUniqueMeals(db, 10));
            setIsExpanded(true);
            bottomSheetRef.current?.snapToIndex(SNAP_FULL);
        },
    }));

    // ── Sheet event handlers ─────────────────────────────────────────────────

    const handleSheetChange = useCallback((index: number) => {
        if (index === SNAP_QUICK) setIsExpanded(false);
        else if (index === SNAP_FULL) setIsExpanded(true);
    }, []);

    const handleClose = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    const handleExpand = useCallback(() => {
        setIsExpanded(true);
        bottomSheetRef.current?.snapToIndex(SNAP_FULL);
    }, []);

    const handleCollapse = useCallback(() => {
        setIsExpanded(false);
        bottomSheetRef.current?.snapToIndex(SNAP_QUICK);
    }, []);

    const handleSheetClose = useCallback(() => {
        setValidationError(null);
        setShowDatePicker(false);
        setShowTimePicker(false);
        setShowFavoritesPicker(false);
    }, []);

    // ── Favorites picker ─────────────────────────────────────────────────────

    const handleOpenFavoritesPicker = useCallback(() => {
        const templates = getFavoritesByType(db, "template");
        const starred = getFavoritesByType(db, "starred");
        const sections: Array<{ title: string; data: Favorite[] }> = [];
        if (templates.length > 0) {
            sections.push({
                title: t("mealForm.favorites_picker_section_templates"),
                data: templates,
            });
        }
        if (starred.length > 0) {
            sections.push({
                title: t("mealForm.favorites_picker_section_starred"),
                data: starred,
            });
        }
        setFavoritesSections(sections);
        setShowFavoritesPicker(true);
    }, [db, t]);

    const handlePickFavorite = useCallback(
        (fav: Favorite) => {
            setMealText(fav.mealText);
            if (fav.calories != null) {
                setCalories(fav.calories.toString());
            }
            if (validationError) {
                setValidationError(null);
            }
            setShowFavoritesPicker(false);
        },
        [validationError],
    );

    const handlePickSuggestion = useCallback(
        (suggestion: string) => {
            setMealText(suggestion);
            if (validationError) {
                setValidationError(null);
            }
        },
        [validationError],
    );

    // ── Save ─────────────────────────────────────────────────────────────────

    const handleSave = useCallback(() => {
        const trimmed = mealText.trim();
        if (!trimmed) {
            setValidationError(t("mealForm.validation_required"));
            return;
        }

        setIsSaving(true);
        try {
            const rawCalories = calories.trim()
                ? parseInt(calories.trim(), 10)
                : null;
            const cleanCalories =
                rawCalories !== null && !isNaN(rawCalories)
                    ? rawCalories
                    : null;
            const cleanNotes = notes.trim() || null;

            if (mode === "add") {
                createMeal(db, {
                    date: selectedDate,
                    time: selectedTime,
                    mealType,
                    mealText: trimmed,
                    calories: cleanCalories,
                    aiAnalysis: cleanNotes,
                });
            } else if (editMealId !== null) {
                updateMeal(db, editMealId, {
                    date: selectedDate,
                    time: selectedTime,
                    mealType,
                    mealText: trimmed,
                    calories: cleanCalories,
                    aiAnalysis: cleanNotes,
                });
            }

            bottomSheetRef.current?.close();
            onSaved(selectedDate);
        } catch (error) {
            console.error("Failed to save meal:", error);
            setValidationError(t("mealForm.save_error"));
        } finally {
            setIsSaving(false);
        }
    }, [
        mealText,
        calories,
        notes,
        mode,
        editMealId,
        selectedDate,
        selectedTime,
        mealType,
        db,
        onSaved,
        t,
    ]);

    const handleDelete = useCallback(() => {
        if (editMealId === null) {
            return;
        }

        Alert.alert(
            t("mealForm.delete_confirm_title"),
            t("mealForm.delete_confirm_message"),
            [
                {
                    text: t("mealForm.delete_confirm_cancel"),
                    style: "cancel",
                },
                {
                    text: t("mealForm.delete_confirm_ok"),
                    style: "destructive",
                    onPress: () => {
                        try {
                            deleteMeal(db, editMealId);
                            bottomSheetRef.current?.close();
                            onSaved(selectedDate);
                        } catch (error) {
                            console.error("Failed to delete meal:", error);
                            setValidationError(t("mealForm.delete_error"));
                        }
                    },
                },
            ],
        );
    }, [db, editMealId, onSaved, selectedDate, t]);

    // ── Date/time picker handlers ────────────────────────────────────────────

    const handleDateChange = useCallback((_: unknown, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            setSelectedDate(`${y}-${m}-${d}`);
        }
    }, []);

    const handleTimeChange = useCallback((_: unknown, time?: Date) => {
        setShowTimePicker(false);
        if (time) {
            const h = String(time.getHours()).padStart(2, "0");
            const m = String(time.getMinutes()).padStart(2, "0");
            setSelectedTime(`${h}:${m}`);
        }
    }, []);

    const datePickerValue = useMemo(() => {
        const parts = selectedDate.split("-");
        if (parts.length === 3) {
            return new Date(+parts[0], +parts[1] - 1, +parts[2]);
        }
        return new Date();
    }, [selectedDate]);

    const timePickerValue = useMemo(() => {
        const d = new Date();
        const parts = selectedTime.split(":");
        if (parts.length === 2) {
            d.setHours(+parts[0], +parts[1], 0, 0);
        }
        return d;
    }, [selectedTime]);

    // ── Display helpers ──────────────────────────────────────────────────────

    const formatDisplayDate = (dateStr: string) => {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    // ── Shared computed styles ───────────────────────────────────────────────

    const sectionLabel = useMemo(
        () => ({
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semiBold,
            marginBottom: spacing.xs,
            textTransform: "uppercase" as const,
            letterSpacing: 0.5 as const,
        }),
        [colors, typography, spacing],
    );

    const fieldRowButton = useMemo(
        () => ({
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
            borderWidth: 1,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: spacing.sm,
        }),
        [colors, borderRadius, spacing],
    );

    const chipFor = useCallback(
        (selected: boolean) => ({
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            backgroundColor: selected ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: selected ? colors.primary : colors.border,
            margin: 3,
        }),
        [colors, borderRadius, spacing],
    );

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                onChange={handleSheetChange}
                onClose={handleSheetClose}
                handleIndicatorStyle={{
                    backgroundColor: colors.textMuted,
                }}
                backgroundStyle={{
                    backgroundColor: colors.surfaceElevated,
                }}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                {isExpanded ? (
                    // ── FULL FORM ─────────────────────────────────────────────
                    <View style={styles.fullContainer}>
                        {/* Fixed header */}
                        <View
                            style={[
                                styles.formHeader,
                                {
                                    paddingHorizontal: spacing.lg,
                                    paddingBottom: spacing.sm,
                                    borderBottomColor: colors.divider,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={handleCollapse}
                                style={styles.iconBtn}
                                testID="meal-form-collapse-btn"
                                accessibilityLabel={t("mealForm.btn_collapse")}
                            >
                                <Ionicons
                                    name="chevron-down"
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>

                            <Text
                                style={[
                                    styles.headerTitle,
                                    {
                                        color: colors.textPrimary,
                                        fontSize: typography.fontSize.xl,
                                        fontWeight: typography.fontWeight.bold,
                                    },
                                ]}
                            >
                                {mode === "add"
                                    ? t("mealForm.title_add")
                                    : t("mealForm.title_edit")}
                            </Text>

                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.iconBtn}
                                testID="meal-form-close-btn"
                                accessibilityLabel={t("mealForm.btn_cancel")}
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable fields */}
                        <BottomSheetScrollView
                            style={styles.scrollArea}
                            contentContainerStyle={[
                                styles.scrollContent,
                                {
                                    paddingHorizontal: spacing.lg,
                                    paddingTop: spacing.md,
                                    paddingBottom: spacing.xxl,
                                },
                            ]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Meal type chips */}
                            <Text style={sectionLabel}>
                                {t("mealForm.field_meal_type")}
                            </Text>
                            <View
                                style={[
                                    styles.chipRow,
                                    { marginBottom: spacing.md },
                                ]}
                            >
                                {MEAL_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={chipFor(mealType === type)}
                                        onPress={() => setMealType(type)}
                                        testID={`meal-form-type-${type}`}
                                        accessibilityLabel={t(
                                            `mealTypes.${type}`,
                                        )}
                                    >
                                        <Text
                                            style={{
                                                color:
                                                    mealType === type
                                                        ? colors.textOnAccent
                                                        : colors.textSecondary,
                                                fontSize:
                                                    typography.fontSize.sm,
                                                fontWeight:
                                                    mealType === type
                                                        ? typography.fontWeight
                                                              .semiBold
                                                        : typography.fontWeight
                                                              .regular,
                                            }}
                                        >
                                            {t(`mealTypes.${type}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Date + Time row */}
                            <View
                                style={[
                                    styles.dateTimeRow,
                                    {
                                        gap: spacing.md,
                                        marginBottom: spacing.md,
                                    },
                                ]}
                            >
                                {/* Date */}
                                <View style={styles.dateTimeCell}>
                                    <Text style={sectionLabel}>
                                        {t("mealForm.field_date")}
                                    </Text>
                                    <TouchableOpacity
                                        style={fieldRowButton}
                                        onPress={() => setShowDatePicker(true)}
                                        testID="meal-form-date-btn"
                                        accessibilityLabel={t(
                                            "mealForm.field_date",
                                        )}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={colors.textSecondary}
                                        />
                                        <Text
                                            style={{
                                                color: colors.textPrimary,
                                                fontSize:
                                                    typography.fontSize.md,
                                                flex: 1,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {formatDisplayDate(selectedDate)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Time */}
                                <View style={styles.dateTimeCell}>
                                    <Text style={sectionLabel}>
                                        {t("mealForm.field_time")}
                                    </Text>
                                    <TouchableOpacity
                                        style={fieldRowButton}
                                        onPress={() => setShowTimePicker(true)}
                                        testID="meal-form-time-btn"
                                        accessibilityLabel={t(
                                            "mealForm.field_time",
                                        )}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={16}
                                            color={colors.textSecondary}
                                        />
                                        <Text
                                            style={{
                                                color: colors.textPrimary,
                                                fontSize:
                                                    typography.fontSize.md,
                                                flex: 1,
                                            }}
                                        >
                                            {selectedTime}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Meal text */}
                            <View
                                style={[
                                    styles.fieldLabelRow,
                                    { marginBottom: spacing.xs },
                                ]}
                            >
                                <Text
                                    style={[sectionLabel, { marginBottom: 0 }]}
                                >
                                    {t("mealForm.field_meal_text")}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.favoritesBtn,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            borderRadius: borderRadius.md,
                                            paddingVertical: 4,
                                            paddingHorizontal: spacing.sm,
                                            gap: 4,
                                        },
                                    ]}
                                    onPress={handleOpenFavoritesPicker}
                                    activeOpacity={0.8}
                                    testID="meal-form-full-favorites-btn"
                                    accessibilityLabel={t(
                                        "mealForm.btn_from_favorites",
                                    )}
                                >
                                    <Ionicons
                                        name="star-outline"
                                        size={13}
                                        color={colors.star}
                                    />
                                    <Text
                                        style={{
                                            color: colors.textSecondary,
                                            fontSize: typography.fontSize.xs,
                                        }}
                                    >
                                        {t("mealForm.btn_from_favorites")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <BottomSheetTextInput
                                multiline
                                onChangeText={(v) => {
                                    setMealText(v);
                                    if (validationError)
                                        setValidationError(null);
                                }}
                                placeholder={t(
                                    "mealForm.placeholder_meal_text",
                                )}
                                placeholderTextColor={colors.inputPlaceholder}
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        borderColor: validationError
                                            ? colors.error
                                            : colors.inputBorder,
                                        borderRadius: borderRadius.md,
                                        color: colors.textPrimary,
                                        fontSize: typography.fontSize.md,
                                        marginBottom: spacing.xs,
                                        padding: spacing.md,
                                        minHeight: 80,
                                    },
                                ]}
                                testID="meal-form-meal-text-input"
                                textAlignVertical="top"
                                value={mealText}
                            />

                            {/* Recent meal suggestions */}
                            {filteredSuggestions.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{
                                        paddingVertical: spacing.xs,
                                        paddingBottom: spacing.sm,
                                    }}
                                >
                                    {filteredSuggestions.map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            testID={`meal-form-suggestion-chip-${s}`}
                                            accessibilityLabel={s}
                                            onPress={() => handlePickSuggestion(s)}
                                            style={{
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                borderWidth: 1,
                                                borderRadius: borderRadius.full,
                                                paddingHorizontal: spacing.md,
                                                paddingVertical: spacing.xs,
                                                marginRight: spacing.sm,
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: colors.textSecondary,
                                                    fontSize: typography.fontSize.sm,
                                                }}
                                            >
                                                {s}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                            {validationError ? (
                                <Text
                                    style={{
                                        color: colors.error,
                                        fontSize: typography.fontSize.sm,
                                        marginBottom: spacing.sm,
                                    }}
                                >
                                    {validationError}
                                </Text>
                            ) : (
                                <View style={{ height: spacing.md }} />
                            )}

                            {/* Calories */}
                            <Text style={sectionLabel}>
                                {t("mealForm.field_calories")}
                            </Text>
                            <BottomSheetTextInput
                                keyboardType="number-pad"
                                onChangeText={setCalories}
                                placeholder={t("mealForm.placeholder_calories")}
                                placeholderTextColor={colors.inputPlaceholder}
                                style={[
                                    styles.singleLineInput,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        borderColor: colors.inputBorder,
                                        borderRadius: borderRadius.md,
                                        color: colors.textPrimary,
                                        fontSize: typography.fontSize.md,
                                        marginBottom: spacing.md,
                                        padding: spacing.md,
                                    },
                                ]}
                                testID="meal-form-calories-input"
                                value={calories}
                            />

                            {/* Notes */}
                            <Text style={sectionLabel}>
                                {t("mealForm.field_notes")}
                            </Text>
                            <BottomSheetTextInput
                                multiline
                                onChangeText={setNotes}
                                placeholder={t("mealForm.placeholder_notes")}
                                placeholderTextColor={colors.inputPlaceholder}
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        borderColor: colors.inputBorder,
                                        borderRadius: borderRadius.md,
                                        color: colors.textPrimary,
                                        fontSize: typography.fontSize.md,
                                        padding: spacing.md,
                                        minHeight: 64,
                                    },
                                ]}
                                testID="meal-form-notes-input"
                                textAlignVertical="top"
                                value={notes}
                            />
                        </BottomSheetScrollView>

                        {/* Fixed footer — always visible above keyboard */}
                        <View
                            style={[
                                styles.footer,
                                {
                                    paddingHorizontal: spacing.lg,
                                    paddingTop: spacing.sm,
                                    paddingBottom: spacing.lg + insets.bottom,
                                    borderTopColor: colors.divider,
                                    gap: spacing.sm,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.cancelBtn,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        borderRadius: borderRadius.md,
                                        paddingVertical: spacing.md,
                                    },
                                ]}
                                onPress={handleClose}
                                activeOpacity={0.85}
                                testID="meal-form-cancel-btn"
                                accessibilityLabel={t("mealForm.btn_cancel")}
                            >
                                <Text
                                    style={{
                                        color: colors.textPrimary,
                                        fontSize: typography.fontSize.md,
                                        fontWeight:
                                            typography.fontWeight.semiBold,
                                    }}
                                >
                                    {t("mealForm.btn_cancel")}
                                </Text>
                            </TouchableOpacity>

                            {mode === "edit" && (
                                <TouchableOpacity
                                    style={[
                                        styles.deleteBtn,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.error,
                                            borderRadius: borderRadius.md,
                                            paddingVertical: spacing.md,
                                        },
                                    ]}
                                    onPress={handleDelete}
                                    activeOpacity={0.85}
                                    testID="meal-form-delete-btn"
                                    accessibilityLabel={t(
                                        "mealForm.btn_delete",
                                    )}
                                >
                                    <Text
                                        style={{
                                            color: colors.error,
                                            fontSize: typography.fontSize.md,
                                            fontWeight:
                                                typography.fontWeight.semiBold,
                                        }}
                                    >
                                        {t("mealForm.btn_delete")}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    {
                                        backgroundColor: isSaving
                                            ? colors.primaryMuted
                                            : colors.primary,
                                        borderRadius: borderRadius.md,
                                        paddingVertical: spacing.md,
                                    },
                                ]}
                                onPress={handleSave}
                                disabled={isSaving}
                                activeOpacity={0.85}
                                testID="meal-form-save-btn"
                                accessibilityLabel={t("mealForm.btn_save")}
                            >
                                <Text
                                    style={{
                                        color: colors.textOnAccent,
                                        fontSize: typography.fontSize.md,
                                        fontWeight: typography.fontWeight.bold,
                                    }}
                                >
                                    {isSaving
                                        ? t("mealForm.btn_saving")
                                        : t("mealForm.btn_save")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // ── QUICK ENTRY ───────────────────────────────────────────
                    <BottomSheetView
                        style={[styles.quickContainer, { padding: spacing.lg }]}
                    >
                        {/* Header */}
                        <View
                            style={[
                                styles.formHeader,
                                {
                                    marginBottom: spacing.sm,
                                    borderBottomColor: colors.divider,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.xl,
                                    fontWeight: typography.fontWeight.bold,
                                    flex: 1,
                                }}
                            >
                                {mode === "add"
                                    ? t("mealForm.title_quick")
                                    : t("mealForm.title_edit")}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.iconBtn}
                                testID="meal-form-quick-close-btn"
                                accessibilityLabel={t("mealForm.btn_cancel")}
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Meal text input */}
                        <BottomSheetTextInput
                            multiline
                            onChangeText={(v) => {
                                setMealText(v);
                                if (validationError) setValidationError(null);
                            }}
                            placeholder={t("mealForm.placeholder_meal_text")}
                            placeholderTextColor={colors.inputPlaceholder}
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: validationError
                                        ? colors.error
                                        : colors.inputBorder,
                                    borderRadius: borderRadius.md,
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.md,
                                    marginBottom: spacing.xs,
                                    padding: spacing.md,
                                    minHeight: 90,
                                },
                            ]}
                            testID="meal-form-quick-input"
                            textAlignVertical="top"
                            value={mealText}
                        />

                        {/* Recent meal suggestions */}
                        {filteredSuggestions.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{
                                    paddingVertical: spacing.xs,
                                    paddingBottom: spacing.sm,
                                }}
                            >
                                {filteredSuggestions.map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        testID={`meal-form-suggestion-chip-${s}`}
                                        accessibilityLabel={s}
                                        onPress={() => handlePickSuggestion(s)}
                                        style={{
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            borderWidth: 1,
                                            borderRadius: borderRadius.full,
                                            paddingHorizontal: spacing.md,
                                            paddingVertical: spacing.xs,
                                            marginRight: spacing.sm,
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                color: colors.textSecondary,
                                                fontSize: typography.fontSize.sm,
                                            }}
                                        >
                                            {s}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {validationError ? (
                            <Text
                                style={{
                                    color: colors.error,
                                    fontSize: typography.fontSize.sm,
                                    marginBottom: spacing.sm,
                                }}
                            >
                                {validationError}
                            </Text>
                        ) : (
                            <View style={{ height: spacing.sm }} />
                        )}

                        {/* Favorites shortcut */}
                        <TouchableOpacity
                            style={[
                                styles.favoritesBtn,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    borderRadius: borderRadius.md,
                                    paddingVertical: spacing.sm,
                                    paddingHorizontal: spacing.md,
                                    marginBottom: spacing.sm,
                                    gap: spacing.sm,
                                },
                            ]}
                            onPress={handleOpenFavoritesPicker}
                            activeOpacity={0.8}
                            testID="meal-form-quick-favorites-btn"
                            accessibilityLabel={t(
                                "mealForm.btn_from_favorites",
                            )}
                        >
                            <Ionicons
                                name="star-outline"
                                size={15}
                                color={colors.star}
                            />
                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                }}
                            >
                                {t("mealForm.btn_from_favorites")}
                            </Text>
                        </TouchableOpacity>

                        {/* Action row */}
                        <View style={[styles.actionRow, { gap: spacing.sm }]}>
                            <TouchableOpacity
                                style={[
                                    styles.expandBtn,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        borderRadius: borderRadius.md,
                                        paddingVertical: spacing.md,
                                        gap: spacing.xs,
                                    },
                                ]}
                                onPress={handleExpand}
                                activeOpacity={0.85}
                                testID="meal-form-expand-btn"
                                accessibilityLabel={t("mealForm.btn_expand")}
                            >
                                <Ionicons
                                    name="expand-outline"
                                    size={15}
                                    color={colors.primary}
                                />
                                <Text
                                    style={{
                                        color: colors.primary,
                                        fontSize: typography.fontSize.sm,
                                        fontWeight:
                                            typography.fontWeight.semiBold,
                                    }}
                                >
                                    {t("mealForm.btn_expand")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.quickSaveBtn,
                                    {
                                        backgroundColor: isSaving
                                            ? colors.primaryMuted
                                            : colors.primary,
                                        borderRadius: borderRadius.md,
                                        paddingVertical: spacing.md,
                                    },
                                ]}
                                onPress={handleSave}
                                disabled={isSaving}
                                activeOpacity={0.85}
                                testID="meal-form-quick-save-btn"
                                accessibilityLabel={t("mealForm.btn_save")}
                            >
                                <Text
                                    style={{
                                        color: colors.textOnAccent,
                                        fontSize: typography.fontSize.md,
                                        fontWeight: typography.fontWeight.bold,
                                    }}
                                >
                                    {isSaving
                                        ? t("mealForm.btn_saving")
                                        : t("mealForm.btn_save")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                )}
            </BottomSheet>

            {/* Favorites picker modal */}
            <Modal
                visible={showFavoritesPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFavoritesPicker(false)}
                statusBarTranslucent
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowFavoritesPicker(false)}
                    accessibilityLabel={t("mealForm.btn_cancel")}
                />
                <View
                    style={[
                        styles.modalSheet,
                        {
                            backgroundColor: colors.surfaceElevated,
                            borderTopLeftRadius: borderRadius.xl,
                            borderTopRightRadius: borderRadius.xl,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.modalHeader,
                            {
                                paddingHorizontal: spacing.lg,
                                paddingVertical: spacing.md,
                                borderBottomColor: colors.divider,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.lg,
                                fontWeight: typography.fontWeight
                                    .bold as TextStyle["fontWeight"],
                                flex: 1,
                            }}
                        >
                            {t("mealForm.favorites_picker_title")}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFavoritesPicker(false)}
                            style={styles.iconBtn}
                            testID="favorites-picker-close-btn"
                            accessibilityLabel={t("mealForm.btn_cancel")}
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>
                    {favoritesSections.length === 0 ? (
                        <View style={styles.modalEmpty}>
                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.md,
                                    textAlign: "center",
                                }}
                            >
                                {t("mealForm.favorites_picker_empty")}
                            </Text>
                        </View>
                    ) : (
                        <SectionList
                            sections={favoritesSections}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{
                                paddingVertical: spacing.sm,
                            }}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text
                                    style={[
                                        sectionLabel,
                                        {
                                            paddingHorizontal: spacing.lg,
                                            paddingTop: spacing.sm,
                                        },
                                    ]}
                                >
                                    {title}
                                </Text>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.favoriteRow,
                                        {
                                            paddingHorizontal: spacing.lg,
                                            paddingVertical: spacing.md,
                                            borderBottomColor: colors.divider,
                                        },
                                    ]}
                                    onPress={() => handlePickFavorite(item)}
                                    activeOpacity={0.7}
                                    testID={`favorites-picker-item-${item.id}`}
                                    accessibilityLabel={item.name}
                                >
                                    <View style={styles.favoriteRowLeft}>
                                        <Ionicons
                                            name={
                                                item.type === "template"
                                                    ? "bookmark-outline"
                                                    : "star-outline"
                                            }
                                            size={16}
                                            color={
                                                item.type === "template"
                                                    ? colors.primary
                                                    : colors.star
                                            }
                                            style={{ marginTop: 2 }}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    color: colors.textPrimary,
                                                    fontSize:
                                                        typography.fontSize.md,
                                                    fontWeight: typography
                                                        .fontWeight
                                                        .semiBold as TextStyle["fontWeight"],
                                                }}
                                                numberOfLines={1}
                                            >
                                                {item.name}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: colors.textSecondary,
                                                    fontSize:
                                                        typography.fontSize.sm,
                                                    marginTop: 2,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {item.mealText}
                                            </Text>
                                        </View>
                                    </View>
                                    {item.calories != null && (
                                        <Text
                                            style={{
                                                color: colors.secondary,
                                                fontSize:
                                                    typography.fontSize.sm,
                                                fontWeight: typography
                                                    .fontWeight
                                                    .bold as TextStyle["fontWeight"],
                                                marginLeft: spacing.sm,
                                            }}
                                        >
                                            {item.calories} {t("common.kcal_unit")}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modal>

            {/* Native date picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={datePickerValue}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {/* Native time picker */}
            {showTimePicker && (
                <DateTimePicker
                    value={timePickerValue}
                    mode="time"
                    is24Hour
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
        </>
    );
});

MealFormSheet.displayName = "MealFormSheet";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    quickContainer: {
        flex: 1,
    },
    formHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
    },
    iconBtn: {
        padding: 6,
        minWidth: 34,
        minHeight: 34,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dateTimeRow: {
        flexDirection: "row",
    },
    dateTimeCell: {
        flex: 1,
    },
    textInput: {
        borderWidth: 1,
    },
    singleLineInput: {
        borderWidth: 1,
    },
    footer: {
        flexDirection: "row",
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    cancelBtn: {
        flex: 1,
        alignItems: "center",
        borderWidth: 1,
    },
    deleteBtn: {
        flex: 1,
        alignItems: "center",
        borderWidth: 1,
    },
    saveBtn: {
        flex: 2,
        alignItems: "center",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    expandBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    quickSaveBtn: {
        flex: 2,
        alignItems: "center",
    },
    fieldLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    favoritesBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalEmpty: {
        padding: 32,
        alignItems: "center",
    },
    favoriteRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    favoriteRowLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: "60%",
        overflow: "hidden",
    },
});
