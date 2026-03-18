import BottomSheet, {
    BottomSheetScrollView,
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "../db/DatabaseProvider";
import { createFavorite, updateFavorite } from "../db/favorites";
import type { Favorite } from "../db/schema";
import { useTheme } from "../theme";

// ─── Public handle ────────────────────────────────────────────────────────────

export interface TemplateFormSheetHandle {
    openAdd: () => void;
    openEdit: (template: Favorite) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplateFormSheetProps {
    /** Called after a successful save so the parent can reload its list. */
    onSaved: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TemplateFormSheet = forwardRef<
    TemplateFormSheetHandle,
    TemplateFormSheetProps
>(({ onSaved }, ref) => {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["55%", "80%"], []);
    const defaultOpenIndex = 1;

    // ── Form state ───────────────────────────────────────────────────────────
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [mealText, setMealText] = useState("");
    const [calories, setCalories] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        setMode("add");
        setEditId(null);
        setName("");
        setMealText("");
        setCalories("");
        setValidationError(null);
        setIsSaving(false);
    }, []);

    // ── Imperative handle ────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
        openAdd: () => {
            reset();
            bottomSheetRef.current?.snapToIndex(defaultOpenIndex);
        },
        openEdit: (template) => {
            setMode("edit");
            setEditId(template.id);
            setName(template.name);
            setMealText(template.mealText);
            setCalories(template.calories?.toString() ?? "");
            setValidationError(null);
            setIsSaving(false);
            bottomSheetRef.current?.snapToIndex(defaultOpenIndex);
        },
    }));

    // ── Sheet handlers ───────────────────────────────────────────────────────

    const handleClose = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    const handleSheetClose = useCallback(() => {
        setValidationError(null);
    }, []);

    // ── Save ─────────────────────────────────────────────────────────────────

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        const trimmedMeal = mealText.trim();

        if (!trimmedName) {
            setValidationError(t("favorites.validation_name_required"));
            return;
        }
        if (!trimmedMeal) {
            setValidationError(t("favorites.validation_meal_text_required"));
            return;
        }

        setIsSaving(true);
        try {
            const rawCal = calories.trim()
                ? parseInt(calories.trim(), 10)
                : null;
            const cleanCal = rawCal !== null && !isNaN(rawCal) ? rawCal : null;

            if (mode === "add") {
                createFavorite(db, {
                    type: "template",
                    name: trimmedName,
                    mealText: trimmedMeal,
                    calories: cleanCal,
                });
            } else if (editId !== null) {
                updateFavorite(db, editId, {
                    name: trimmedName,
                    mealText: trimmedMeal,
                    calories: cleanCal,
                });
            }

            bottomSheetRef.current?.close();
            onSaved();
        } catch (err) {
            console.error("Failed to save template:", err);
            setValidationError(t("favorites.save_error"));
        } finally {
            setIsSaving(false);
        }
    }, [name, mealText, calories, mode, editId, db, onSaved, t]);

    // ── Render ───────────────────────────────────────────────────────────────

    const titleText = t(
        mode === "add"
            ? "favorites.template_form_title_add"
            : "favorites.template_form_title_edit",
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={handleSheetClose}
            handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
            backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
        >
            <View style={styles.sheetContent}>
                {/* ── Header ─────────────────────────────────────────────────── */}
                <View
                    style={[
                        styles.header,
                        {
                            paddingHorizontal: spacing.lg,
                            paddingBottom: spacing.sm,
                            borderBottomColor: colors.divider,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.iconBtn}
                        testID="template-form-cancel-btn"
                        accessibilityLabel={t("favorites.btn_cancel")}
                    >
                        <Ionicons
                            name="close"
                            size={22}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.lg,
                                fontWeight: typography.fontWeight.semiBold,
                            },
                        ]}
                    >
                        {titleText}
                    </Text>
                    <View style={styles.iconBtn} />
                </View>

                {/* ── Scrollable fields ──────────────────────────────────────── */}
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
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.fieldLabel,
                                {
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.semiBold,
                                },
                            ]}
                        >
                            {t("favorites.field_name")}
                        </Text>
                        <BottomSheetTextInput
                            testID="template-form-name-input"
                            value={name}
                            onChangeText={(v) => {
                                setName(v);
                                if (validationError) setValidationError(null);
                            }}
                            placeholder={t("favorites.placeholder_name")}
                            placeholderTextColor={colors.inputPlaceholder}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor:
                                        validationError && !name.trim()
                                            ? colors.error
                                            : colors.inputBorder,
                                    borderRadius: borderRadius.md,
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.md,
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.md,
                                },
                            ]}
                        />
                    </View>

                    {/* Meal text */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.fieldLabel,
                                {
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.semiBold,
                                },
                            ]}
                        >
                            {t("favorites.field_meal_text")}
                        </Text>
                        <BottomSheetTextInput
                            testID="template-form-meal-text-input"
                            value={mealText}
                            onChangeText={(v) => {
                                setMealText(v);
                                if (validationError) setValidationError(null);
                            }}
                            placeholder={t("favorites.placeholder_meal_text")}
                            placeholderTextColor={colors.inputPlaceholder}
                            multiline
                            numberOfLines={4}
                            style={[
                                styles.input,
                                styles.multilineInput,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor:
                                        validationError && !mealText.trim()
                                            ? colors.error
                                            : colors.inputBorder,
                                    borderRadius: borderRadius.md,
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.md,
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.md,
                                },
                            ]}
                        />
                    </View>

                    {/* Calories */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.fieldLabel,
                                {
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.semiBold,
                                },
                            ]}
                        >
                            {t("favorites.field_calories")}
                        </Text>
                        <BottomSheetTextInput
                            testID="template-form-calories-input"
                            value={calories}
                            onChangeText={setCalories}
                            placeholder={t("favorites.placeholder_calories")}
                            placeholderTextColor={colors.inputPlaceholder}
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: colors.inputBorder,
                                    borderRadius: borderRadius.md,
                                    color: colors.textPrimary,
                                    fontSize: typography.fontSize.md,
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.md,
                                },
                            ]}
                        />
                    </View>

                    {/* Validation error */}
                    {validationError !== null && (
                        <Text
                            style={[
                                styles.errorText,
                                {
                                    color: colors.error,
                                    fontSize: typography.fontSize.sm,
                                },
                            ]}
                        >
                            {validationError}
                        </Text>
                    )}
                </BottomSheetScrollView>

                <View
                    style={[
                        styles.footer,
                        {
                            paddingHorizontal: spacing.lg,
                            paddingTop: spacing.sm,
                            paddingBottom: spacing.lg + insets.bottom,
                            borderTopColor: colors.divider,
                        },
                    ]}
                >
                    <TouchableOpacity
                        testID="template-form-save-btn"
                        onPress={handleSave}
                        disabled={isSaving}
                        accessibilityLabel={t("favorites.btn_save")}
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
                    >
                        <Text
                            style={[
                                styles.saveBtnText,
                                {
                                    color: colors.textOnAccent,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: typography.fontWeight.bold,
                                },
                            ]}
                        >
                            {t("favorites.btn_save")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );
});

TemplateFormSheet.displayName = "TemplateFormSheet";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    sheetContent: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        gap: 16,
    },
    fieldGroup: {
        gap: 6,
    },
    fieldLabel: {
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
    },
    multilineInput: {
        minHeight: 96,
        textAlignVertical: "top",
    },
    errorText: {
        marginTop: 2,
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    saveBtn: {
        alignItems: "center",
        justifyContent: "center",
    },
    saveBtnText: {
        textAlign: "center",
    },
});
