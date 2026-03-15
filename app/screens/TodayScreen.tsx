import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayView } from "../../components/DayView";
import { useDatabase } from "../../db/DatabaseProvider";
import { createMeal } from "../../db/meals";
import type { MealType } from "../../db/schema";
import { useTheme } from "../../theme";

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getLocalTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

const getMealTypeForCurrentTime = (date: Date): MealType => {
    const hour = date.getHours();

    if (hour >= 5 && hour < 10) {
        return "breakfast";
    }

    if (hour >= 10 && hour < 12) {
        return "second_breakfast";
    }

    if (hour >= 12 && hour < 15) {
        return "lunch";
    }

    if (hour >= 15 && hour < 18) {
        return "afternoon_snack";
    }

    if (hour >= 18 && hour < 21) {
        return "dinner";
    }

    return "snack";
};

export default function TodayScreen() {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius, shadows } = useTheme();

    const [currentDate, setCurrentDate] = useState(getLocalDateString);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mealText, setMealText] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["42%"], []);

    useFocusEffect(
        useCallback(() => {
            setCurrentDate(getLocalDateString());
        }, []),
    );

    const handleOpenQuickEntry = () => {
        setMealText("");
        setValidationError(null);
        bottomSheetRef.current?.snapToIndex(0);
    };

    const handleCloseQuickEntry = () => {
        bottomSheetRef.current?.close();
    };

    const handleSaveMeal = () => {
        const trimmedMealText = mealText.trim();

        if (!trimmedMealText) {
            setValidationError(t("today.quick_entry_validation_required"));
            return;
        }

        setIsSaving(true);

        try {
            const now = new Date();

            createMeal(db, {
                date: currentDate,
                time: getLocalTimeString(),
                mealType: getMealTypeForCurrentTime(now),
                mealText: trimmedMealText,
            });

            setMealText("");
            setValidationError(null);
            setRefreshKey((previous) => previous + 1);
            bottomSheetRef.current?.close();
        } catch (error) {
            console.error("Failed to create meal:", error);
            setValidationError(t("today.quick_entry_save_error"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <DayView
                date={currentDate}
                onDateChange={setCurrentDate}
                reloadKey={refreshKey}
            />

            <TouchableOpacity
                accessibilityLabel={t("today.quick_entry_open")}
                activeOpacity={0.9}
                onPress={handleOpenQuickEntry}
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
                testID="today-quick-entry-fab"
            >
                <Ionicons name="add" size={28} color={colors.textOnAccent} />
            </TouchableOpacity>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                enablePanDownToClose
                handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
                backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                onClose={() => {
                    setValidationError(null);
                }}
                snapPoints={snapPoints}
            >
                <BottomSheetView
                    style={[styles.sheetContent, { padding: spacing.lg }]}
                >
                    <Text
                        style={{
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            marginBottom: spacing.sm,
                        }}
                    >
                        {t("today.quick_entry_title")}
                    </Text>

                    <BottomSheetTextInput
                        multiline
                        onChangeText={(value) => {
                            setMealText(value);
                            if (validationError) {
                                setValidationError(null);
                            }
                        }}
                        placeholder={t("today.quick_entry_placeholder")}
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
                                marginBottom: spacing.sm,
                                padding: spacing.md,
                            },
                        ]}
                        testID="today-quick-entry-input"
                        textAlignVertical="top"
                        value={mealText}
                    />

                    {validationError ? (
                        <Text
                            style={{
                                color: colors.error,
                                fontSize: typography.fontSize.sm,
                                marginBottom: spacing.md,
                            }}
                        >
                            {validationError}
                        </Text>
                    ) : null}

                    <View style={[styles.actions, { gap: spacing.sm }]}>
                        <TouchableOpacity
                            accessibilityLabel={t("today.quick_entry_cancel")}
                            activeOpacity={0.85}
                            onPress={handleCloseQuickEntry}
                            style={[
                                styles.secondaryButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    borderRadius: borderRadius.md,
                                    paddingVertical: spacing.md,
                                },
                            ]}
                            testID="today-quick-entry-cancel"
                        >
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: typography.fontWeight.semiBold,
                                }}
                            >
                                {t("today.quick_entry_cancel")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            accessibilityLabel={t("today.quick_entry_save")}
                            activeOpacity={0.85}
                            disabled={isSaving}
                            onPress={handleSaveMeal}
                            style={[
                                styles.primaryButton,
                                {
                                    backgroundColor: isSaving
                                        ? colors.primaryMuted
                                        : colors.primary,
                                    borderRadius: borderRadius.md,
                                    paddingVertical: spacing.md,
                                },
                            ]}
                            testID="today-quick-entry-save"
                        >
                            <Text
                                style={{
                                    color: colors.textOnAccent,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: typography.fontWeight.bold,
                                }}
                            >
                                {isSaving
                                    ? t("today.quick_entry_saving")
                                    : t("today.quick_entry_save")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        alignItems: "center",
        height: 56,
        justifyContent: "center",
        position: "absolute",
        width: 56,
    },
    sheetContent: {
        flex: 1,
    },
    textInput: {
        borderWidth: 1,
        minHeight: 120,
    },
    actions: {
        flexDirection: "row",
    },
    secondaryButton: {
        alignItems: "center",
        borderWidth: 1,
        flex: 1,
        justifyContent: "center",
    },
    primaryButton: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
});
