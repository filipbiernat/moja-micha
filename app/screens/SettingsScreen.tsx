import React, { useMemo, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
    TextInput,
    Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemePreference, type Theme } from "../../theme";
import {
    useLanguage,
    type LanguagePreference,
} from "../../i18n/LanguageProvider";
import { useDatabase } from "../../db";
import { getSetting, setSetting, deleteSetting } from "../../db/settings";
import { SETTING_KEYS } from "../../db/schema";

export default function SettingsScreen() {
    const theme = useTheme();
    const { preference: themePref, setPreference: setThemePref } = theme;

    const { preference: langPref, setPreference: setLangPref } = useLanguage();

    const { t } = useTranslation();
    const db = useDatabase();

    // Calorie goal state — loaded from DB via two lazy useState initializers
    const [goalEnabled, setGoalEnabled] = useState<boolean>(() => {
        try {
            const val = getSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL);
            return val !== null && val !== "";
        } catch {
            return false;
        }
    });
    const [goalText, setGoalText] = useState<string>(() => {
        try {
            return getSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL) ?? "";
        } catch {
            return "";
        }
    });

    const handleToggleGoal = useCallback(
        (enabled: boolean) => {
            setGoalEnabled(enabled);
            if (!enabled) {
                setGoalText("");
                try {
                    deleteSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL);
                } catch {
                    /* ignore */
                }
            } else if (goalText.trim() !== "") {
                try {
                    setSetting(
                        db,
                        SETTING_KEYS.DAILY_CALORIE_GOAL,
                        goalText.trim(),
                    );
                } catch {
                    /* ignore */
                }
            }
        },
        [db, goalText],
    );

    const handleGoalCommit = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            setGoalText(trimmed);
            if (
                trimmed === "" ||
                isNaN(Number(trimmed)) ||
                Number(trimmed) <= 0
            ) {
                try {
                    deleteSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL);
                } catch {
                    /* ignore */
                }
            } else {
                try {
                    setSetting(db, SETTING_KEYS.DAILY_CALORIE_GOAL, trimmed);
                } catch {
                    /* ignore */
                }
            }
        },
        [db],
    );

    // Dynamic styles to properly use theme tokens without inline style spam
    const styles = useMemo(() => createStyles(theme), [theme]);

    const THEME_OPTIONS: {
        value: ThemePreference;
        label: string;
        emoji: string;
    }[] = useMemo(
        () => [
            { value: "dark", label: t("settings.theme_dark"), emoji: "🌙" },
            { value: "light", label: t("settings.theme_light"), emoji: "☀️" },
            { value: "system", label: t("settings.theme_system"), emoji: "📱" },
        ],
        [t],
    );

    const LANG_OPTIONS: {
        value: LanguagePreference;
        label: string;
        emoji: string;
    }[] = useMemo(
        () => [
            { value: "pl", label: t("settings.lang_pl"), emoji: "🇵🇱" },
            { value: "en", label: t("settings.lang_en"), emoji: "🇬🇧" },
            { value: "system", label: t("settings.lang_system"), emoji: "📱" },
        ],
        [t],
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t("settings.title")}</Text>
            </View>

            {/* Theme section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    {t("settings.theme_section")}
                </Text>
                <View style={styles.card}>
                    {THEME_OPTIONS.map((option, index) => {
                        const isActive = themePref === option.value;
                        const isLast = index === THEME_OPTIONS.length - 1;

                        return (
                            <React.Fragment key={option.value}>
                                <TouchableOpacity
                                    style={styles.optionRow}
                                    onPress={() => setThemePref(option.value)}
                                    accessibilityLabel={`${t("settings.theme_section")}: ${option.label}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                >
                                    <Text style={styles.optionEmoji}>
                                        {option.emoji}
                                    </Text>
                                    <Text style={styles.optionLabel}>
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <View style={styles.activeIndicator} />
                                    )}
                                </TouchableOpacity>
                                {!isLast && <View style={styles.divider} />}
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            {/* Language section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    {t("settings.lang_section")}
                </Text>
                <View style={styles.card}>
                    {LANG_OPTIONS.map((option, index) => {
                        const isActive = langPref === option.value;
                        const isLast = index === LANG_OPTIONS.length - 1;

                        return (
                            <React.Fragment key={option.value}>
                                <TouchableOpacity
                                    style={styles.optionRow}
                                    onPress={() => setLangPref(option.value)}
                                    accessibilityLabel={`${t("settings.lang_section")}: ${option.label}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                >
                                    <Text style={styles.optionEmoji}>
                                        {option.emoji}
                                    </Text>
                                    <Text style={styles.optionLabel}>
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <View style={styles.activeIndicator} />
                                    )}
                                </TouchableOpacity>
                                {!isLast && <View style={styles.divider} />}
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            {/* Calorie goal section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    {t("settings.calorie_goal_section")}
                </Text>
                <View style={styles.card}>
                    <View style={styles.optionRow}>
                        <Text
                            style={[
                                styles.optionLabel,
                                { marginRight: theme.spacing.sm },
                            ]}
                        >
                            {t("settings.calorie_goal_label")}
                        </Text>
                        <Switch
                            value={goalEnabled}
                            onValueChange={handleToggleGoal}
                            thumbColor={
                                goalEnabled
                                    ? theme.colors.primary
                                    : theme.colors.textMuted
                            }
                            trackColor={{
                                false: theme.colors.border,
                                true: theme.colors.primaryMuted,
                            }}
                            testID="settings-calorie-goal-switch"
                        />
                    </View>
                    {goalEnabled && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.optionRow}>
                                <TextInput
                                    style={styles.goalInput}
                                    value={goalText}
                                    onChangeText={setGoalText}
                                    onSubmitEditing={() => {
                                        handleGoalCommit(goalText);
                                        Keyboard.dismiss();
                                    }}
                                    onBlur={() => handleGoalCommit(goalText)}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    placeholder={t(
                                        "settings.calorie_goal_placeholder",
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textMuted
                                    }
                                    maxLength={5}
                                    testID="settings-calorie-goal-input"
                                />
                                <Text style={styles.goalUnit}>
                                    {t("settings.calorie_goal_unit")}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── Dynamic Styles ──────────────────────────────────────────────────────────

const createStyles = ({ colors, typography, spacing, borderRadius }: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            // Replaced hardcoded padding/border with tokens
            paddingTop: spacing.xxxl + spacing.xxl, // approx 56
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
        },
        section: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xxxl,
        },
        sectionLabel: {
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: 1,
            marginBottom: spacing.sm,
            color: colors.textMuted,
        },
        card: {
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            overflow: "hidden",
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.md + 2, // 14
            paddingHorizontal: spacing.lg,
        },
        optionEmoji: {
            fontSize: typography.fontSize.xl,
            marginRight: spacing.md,
        },
        optionLabel: {
            flex: 1,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: colors.textPrimary,
        },
        activeIndicator: {
            width: spacing.sm,
            height: spacing.sm,
            borderRadius: borderRadius.full,
            backgroundColor: colors.primary,
        },
        divider: {
            height: 1,
            marginLeft: spacing.huge,
            backgroundColor: colors.divider,
        },
        goalInput: {
            flex: 1,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: colors.textPrimary,
            paddingVertical: 0,
            minWidth: 80,
        },
        goalUnit: {
            fontSize: typography.fontSize.md,
            color: colors.textMuted,
            marginLeft: spacing.xs,
        },
    });

