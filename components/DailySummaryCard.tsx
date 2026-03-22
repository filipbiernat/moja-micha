import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";

interface DailySummaryCardProps {
    hasApiKey: boolean;
    hasMeals: boolean;
    summaryContent: string | null;
    generatedAt: number | null;
    isGenerating: boolean;
    errorMessage: string | null;
    onGenerate: () => void;
}

export function DailySummaryCard({
    hasApiKey,
    hasMeals,
    summaryContent,
    generatedAt,
    isGenerating,
    errorMessage,
    onGenerate,
}: DailySummaryCardProps) {
    const { t, i18n } = useTranslation();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const markdownStyles = useMemo(
        () => ({
            body: {
                color: colors.textPrimary,
                fontSize: typography.fontSize.sm,
                lineHeight: 22,
            },
            heading2: {
                color: colors.primary,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.bold,
                marginTop: spacing.sm,
                marginBottom: spacing.xs,
            },
            bullet_list: {
                marginTop: spacing.xs,
            },
            list_item: {
                color: colors.textPrimary,
            },
            strong: {
                color: colors.textPrimary,
                fontWeight: typography.fontWeight.bold,
            },
            paragraph: {
                marginTop: spacing.xs,
                marginBottom: spacing.xs,
            },
        }),
        [borderRadius, colors, spacing, typography],
    );

    const generatedLabel =
        generatedAt !== null
            ? new Date(generatedAt).toLocaleString(
                  i18n.language === "pl" ? "pl-PL" : "en-US",
                  {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                  },
              )
            : null;

    const showGenerateButton = hasMeals && hasApiKey;

    return (
        <View
            style={{
                marginTop: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.surfaceElevated,
                padding: spacing.md,
            }}
        >
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.md,
                            fontWeight: typography.fontWeight.bold,
                        }}
                    >
                        {t("dayView.daily_summary_title")}
                    </Text>
                    {generatedLabel ? (
                        <Text
                            style={{
                                marginTop: spacing.xs,
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.xs,
                            }}
                        >
                            {t("dayView.daily_summary_generated_at", {
                                value: generatedLabel,
                            })}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.headerActions}>
                    {summaryContent ? (
                        <TouchableOpacity
                            onPress={() => setIsExpanded((current) => !current)}
                            testID="dayview-daily-summary-toggle-btn"
                            accessibilityLabel={
                                isExpanded
                                    ? t("dayView.daily_summary_hide")
                                    : t("dayView.daily_summary_show")
                            }
                            style={styles.iconActionButton}
                        >
                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    ) : null}

                    {showGenerateButton ? (
                        <TouchableOpacity
                            onPress={onGenerate}
                            disabled={isGenerating}
                            testID="dayview-daily-summary-refresh-btn"
                            accessibilityLabel={
                                summaryContent
                                    ? t("dayView.daily_summary_refresh")
                                    : t("dayView.daily_summary_generate")
                            }
                            style={styles.refreshButton}
                        >
                            {isGenerating ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name={
                                            summaryContent
                                                ? "refresh"
                                                : "sparkles-outline"
                                        }
                                        size={14}
                                        color={colors.primary}
                                    />
                                    <Text
                                        style={{
                                            marginLeft: spacing.xs,
                                            color: colors.primary,
                                            fontSize: typography.fontSize.xs,
                                            fontWeight:
                                                typography.fontWeight.semiBold,
                                        }}
                                    >
                                        {summaryContent
                                            ? t("dayView.daily_summary_refresh")
                                            : t("dayView.daily_summary_generate")}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {errorMessage ? (
                <View
                    style={{
                        marginTop: spacing.sm,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.surfaceHighlight,
                        padding: spacing.sm,
                    }}
                >
                    <Text
                        style={{
                            color: colors.error,
                            fontSize: typography.fontSize.sm,
                        }}
                    >
                        {errorMessage}
                    </Text>
                </View>
            ) : null}

            {summaryContent && isExpanded ? (
                <View style={{ marginTop: spacing.sm }}>
                    <Markdown style={markdownStyles}>{summaryContent}</Markdown>
                </View>
            ) : summaryContent ? null : isGenerating ? (
                <View style={[styles.emptyState, { marginTop: spacing.sm }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text
                        style={{
                            marginTop: spacing.sm,
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                            textAlign: "center",
                        }}
                    >
                        {t("dayView.daily_summary_loading")}
                    </Text>
                </View>
            ) : !hasMeals ? (
                <View style={[styles.emptyState, { marginTop: spacing.sm }]}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                            textAlign: "center",
                        }}
                    >
                        {t("dayView.daily_summary_empty_meals")}
                    </Text>
                </View>
            ) : !hasApiKey ? (
                <View style={[styles.emptyState, { marginTop: spacing.sm }]}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                            textAlign: "center",
                        }}
                    >
                        {t("dayView.daily_summary_missing_key")}
                    </Text>
                </View>
            ) : (
                <View style={{ marginTop: spacing.xs }}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                            textAlign: "center",
                        }}
                    >
                        {t("dayView.daily_summary_empty")}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconActionButton: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    refreshButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 84,
    },
});
