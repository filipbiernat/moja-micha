import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePreference, type Theme } from '../../theme';
import { useLanguage, type LanguagePreference } from '../../i18n/LanguageProvider';

export default function SettingsScreen() {
    const theme = useTheme();
    const { preference: themePref, setPreference: setThemePref } = theme;
    
    const { preference: langPref, setPreference: setLangPref } = useLanguage();
    
    const { t } = useTranslation();

    // Dynamic styles to properly use theme tokens without inline style spam
    const styles = useMemo(() => createStyles(theme), [theme]);

    const THEME_OPTIONS: { value: ThemePreference; label: string; emoji: string }[] = useMemo(() => [
        { value: 'dark', label: t('settings.theme_dark'), emoji: '🌙' },
        { value: 'light', label: t('settings.theme_light'), emoji: '☀️' },
        { value: 'system', label: t('settings.theme_system'), emoji: '📱' },
    ], [t]);

    const LANG_OPTIONS: { value: LanguagePreference; label: string; emoji: string }[] = useMemo(() => [
        { value: 'pl', label: t('settings.lang_pl'), emoji: '🇵🇱' },
        { value: 'en', label: t('settings.lang_en'), emoji: '🇬🇧' },
        { value: 'system', label: t('settings.lang_system'), emoji: '📱' },
    ], [t]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {t('settings.title')}
                </Text>
            </View>

            {/* Theme section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    {t('settings.theme_section')}
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
                                    accessibilityLabel={`${t('settings.theme_section')}: ${option.label}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                >
                                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                    <Text style={styles.optionLabel}>
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <View style={styles.activeIndicator} />
                                    )}
                                </TouchableOpacity>
                                {!isLast && (
                                    <View style={styles.divider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            {/* Language section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    {t('settings.lang_section')}
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
                                    accessibilityLabel={`${t('settings.lang_section')}: ${option.label}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                >
                                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                    <Text style={styles.optionLabel}>
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <View style={styles.activeIndicator} />
                                    )}
                                </TouchableOpacity>
                                {!isLast && (
                                    <View style={styles.divider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            {/* Info */}
            <Text style={styles.infoText}>
                {t('settings.more_settings_info')}
            </Text>
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
            overflow: 'hidden',
        },
        optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
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
        infoText: {
            fontSize: typography.fontSize.sm,
            textAlign: 'center',
            marginTop: spacing.xxxl,
            paddingHorizontal: spacing.xl,
            color: colors.textMuted,
        },
    });
