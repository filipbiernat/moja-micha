import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, type ThemePreference, type Theme } from '../../theme';

type ThemeOption = {
    value: ThemePreference;
    label: string;
    emoji: string;
};

// TODO: i18n
const THEME_OPTIONS: ThemeOption[] = [
    { value: 'dark', label: 'Ciemny', emoji: '🌙' },
    { value: 'light', label: 'Jasny', emoji: '☀️' },
    { value: 'system', label: 'Z systemu', emoji: '📱' },
];

export default function SettingsScreen() {
    const theme = useTheme();
    const { preference, setPreference } = theme;
    
    // Dynamic styles to properly use theme tokens without inline style spam
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    ⚙️ Ustawienia
                </Text>
            </View>

            {/* Theme section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                    MOTYW
                </Text>
                <View style={styles.card}>
                    {THEME_OPTIONS.map((option, index) => {
                        const isActive = preference === option.value;
                        const isLast = index === THEME_OPTIONS.length - 1;

                        return (
                            <React.Fragment key={option.value}>
                                <TouchableOpacity
                                    style={styles.optionRow}
                                    onPress={() => setPreference(option.value)}
                                    accessibilityLabel={`Motyw: ${option.label}`}
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
                Więcej ustawień pojawi się w kolejnych wersjach.
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
