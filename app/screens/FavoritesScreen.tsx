import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useDatabase } from "../../db/DatabaseProvider";
import { deleteFavorite, getFavoritesByType } from "../../db/favorites";
import { createMeal, setMealStarred } from "../../db/meals";
import type { Favorite } from "../../db/schema";
import { useTheme } from "../../theme";
import {
    SortCycleButton,
    TemplateFormSheet,
    type SortCycleOption,
    type TemplateFormSheetHandle,
} from "../../components";
import {
    getMealTypeForCurrentTime,
    getLocalDateString,
    getLocalTimeString,
} from "../../utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "templates" | "starred";
type TemplateSortOrder = "newest" | "oldest" | "alpha";

// ─── Component ────────────────────────────────────────────────────────────────

export default function FavoritesScreen() {
    const { t } = useTranslation();
    const db = useDatabase();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const [activeTab, setActiveTab] = useState<ActiveTab>("templates");
    const [templates, setTemplates] = useState<Favorite[]>([]);
    const [starredItems, setStarredItems] = useState<Favorite[]>([]);
    const [templateSort, setTemplateSort] =
        useState<TemplateSortOrder>("newest");
    const [isLoading, setIsLoading] = useState(true);

    const sortOptions = useMemo<
        ReadonlyArray<SortCycleOption<TemplateSortOrder>>
    >(
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

    const sortedTemplates = useMemo(() => {
        if (templateSort === "alpha") {
            return [...templates].sort((a, b) => a.name.localeCompare(b.name));
        }

        if (templateSort === "oldest") {
            return [...templates].sort((a, b) =>
                a.createdAt.localeCompare(b.createdAt),
            );
        }

        return [...templates].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
        );
    }, [templates, templateSort]);

    const templateFormRef = useRef<TemplateFormSheetHandle>(null);

    // ── Data loading ─────────────────────────────────────────────────────────

    const loadData = useCallback(() => {
        try {
            setTemplates(getFavoritesByType(db, "template"));
            setStarredItems(getFavoritesByType(db, "starred"));
        } catch (error) {
            console.error("Failed to load favorites:", error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleUse = useCallback(
        (fav: Favorite) => {
            try {
                createMeal(db, {
                    date: getLocalDateString(),
                    time: getLocalTimeString(),
                    mealType: getMealTypeForCurrentTime(new Date()),
                    mealText: fav.mealText,
                    calories: fav.calories,
                });
                Alert.alert(
                    t("favorites.use_success_title"),
                    t("favorites.use_success_message"),
                );
            } catch {
                Alert.alert(t("favorites.use_error"));
            }
        },
        [db, t],
    );

    const handleEditTemplate = useCallback((tpl: Favorite) => {
        templateFormRef.current?.openEdit(tpl);
    }, []);

    const handleDeleteTemplate = useCallback(
        (tpl: Favorite) => {
            Alert.alert(
                t("favorites.delete_confirm_title"),
                t("favorites.delete_confirm_message"),
                [
                    {
                        text: t("favorites.delete_confirm_cancel"),
                        style: "cancel",
                    },
                    {
                        text: t("favorites.delete_confirm_ok"),
                        style: "destructive",
                        onPress: () => {
                            try {
                                deleteFavorite(db, tpl.id);
                                loadData();
                            } catch {
                                Alert.alert(t("favorites.use_error"));
                            }
                        },
                    },
                ],
            );
        },
        [db, t, loadData],
    );

    const handleUnstar = useCallback(
        (fav: Favorite) => {
            try {
                deleteFavorite(db, fav.id);
                if (fav.sourceMealId != null) {
                    setMealStarred(db, fav.sourceMealId, false);
                }
                loadData();
            } catch {
                Alert.alert(t("favorites.use_error"));
            }
        },
        [db, t, loadData],
    );

    // ── Render helpers ───────────────────────────────────────────────────────

    const renderTemplate = useCallback(
        ({ item }: { item: Favorite }) => (
            <View
                testID={`template-item-${item.id}`}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.sm,
                        padding: spacing.md,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => handleUse(item)}
                    activeOpacity={0.75}
                    accessibilityLabel={item.name}
                    style={styles.cardContent}
                >
                    <Text
                        numberOfLines={1}
                        style={[
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.md,
                                fontWeight: typography.fontWeight.semiBold,
                            },
                        ]}
                    >
                        {item.name}
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={[
                            {
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.sm,
                            },
                        ]}
                    >
                        {item.mealText}
                    </Text>
                    {item.calories != null && (
                        <Text
                            style={[
                                {
                                    color: colors.primary,
                                    fontSize: typography.fontSize.sm,
                                },
                            ]}
                        >
                            {item.calories} {t("common.kcal_unit")}
                        </Text>
                    )}
                </TouchableOpacity>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        testID={`template-edit-btn-${item.id}`}
                        onPress={() => handleEditTemplate(item)}
                        accessibilityLabel={t("favorites.btn_edit")}
                        style={styles.iconBtn}
                    >
                        <Ionicons
                            name="pencil-outline"
                            size={18}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID={`template-delete-btn-${item.id}`}
                        onPress={() => handleDeleteTemplate(item)}
                        accessibilityLabel={t("favorites.btn_delete")}
                        style={[styles.iconBtn, { marginLeft: spacing.xs }]}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colors.error}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [
            colors,
            typography,
            spacing,
            borderRadius,
            t,
            handleUse,
            handleEditTemplate,
            handleDeleteTemplate,
        ],
    );

    const renderStarred = useCallback(
        ({ item }: { item: Favorite }) => (
            <View
                testID={`starred-item-${item.id}`}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.sm,
                        padding: spacing.md,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => handleUse(item)}
                    activeOpacity={0.75}
                    accessibilityLabel={item.name}
                    style={styles.cardContent}
                >
                    <Text
                        numberOfLines={1}
                        style={[
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.md,
                                fontWeight: typography.fontWeight.semiBold,
                            },
                        ]}
                    >
                        {item.name}
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={[
                            {
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.sm,
                            },
                        ]}
                    >
                        {item.mealText}
                    </Text>
                    {item.calories != null && (
                        <Text
                            style={[
                                {
                                    color: colors.primary,
                                    fontSize: typography.fontSize.sm,
                                },
                            ]}
                        >
                            {item.calories} {t("common.kcal_unit")}
                        </Text>
                    )}
                </TouchableOpacity>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        testID={`starred-unstar-btn-${item.id}`}
                        onPress={() => handleUnstar(item)}
                        accessibilityLabel={t("favorites.btn_unstar")}
                        style={styles.iconBtn}
                    >
                        <Ionicons name="star" size={18} color={colors.star} />
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [colors, typography, spacing, borderRadius, t, handleUse, handleUnstar],
    );

    const renderEmptyTemplates = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{"📋"}</Text>
                <Text
                    style={[
                        styles.emptyTitle,
                        {
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semiBold,
                        },
                    ]}
                >
                    {t("favorites.templates_empty_title")}
                </Text>
                <Text
                    style={[
                        styles.emptySubtitle,
                        {
                            color: colors.textMuted,
                            fontSize: typography.fontSize.sm,
                        },
                    ]}
                >
                    {t("favorites.templates_empty_subtitle")}
                </Text>
            </View>
        ),
        [colors, typography, t],
    );

    const renderEmptyStarred = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{"⭐"}</Text>
                <Text
                    style={[
                        styles.emptyTitle,
                        {
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semiBold,
                        },
                    ]}
                >
                    {t("favorites.starred_empty_title")}
                </Text>
                <Text
                    style={[
                        styles.emptySubtitle,
                        {
                            color: colors.textMuted,
                            fontSize: typography.fontSize.sm,
                        },
                    ]}
                >
                    {t("favorites.starred_empty_subtitle")}
                </Text>
            </View>
        ),
        [colors, typography, t],
    );

    // ── Render ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: colors.background }]}
                edges={["top"]}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
                edges={["top"]}
            >
                {/* Header */}
                <View
                    style={[
                        styles.header,
                        {
                            paddingHorizontal: spacing.lg,
                            paddingBottom: spacing.sm,
                        },
                    ]}
                >
                    <Text
                        style={[
                            {
                                color: colors.textPrimary,
                                fontSize: typography.fontSize.xxl,
                                fontWeight: typography.fontWeight.bold,
                            },
                        ]}
                    >
                        {t("tabs.favorites")}
                    </Text>
                </View>

                {/* Segmented control */}
                <View
                    style={[
                        styles.segmentedControl,
                        {
                            marginHorizontal: spacing.lg,
                            marginBottom: spacing.md,
                            borderColor: colors.border,
                            borderRadius: borderRadius.lg,
                            backgroundColor: colors.surface,
                        },
                    ]}
                >
                    <TouchableOpacity
                        testID="favorites-tab-templates"
                        onPress={() => setActiveTab("templates")}
                        accessibilityLabel={t("favorites.tab_templates")}
                        style={[
                            styles.segment,
                            {
                                borderRadius: borderRadius.lg - 2,
                                backgroundColor:
                                    activeTab === "templates"
                                        ? colors.primary
                                        : "transparent",
                                margin: 3,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                {
                                    color:
                                        activeTab === "templates"
                                            ? colors.textOnAccent
                                            : colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.semiBold,
                                },
                            ]}
                        >
                            {t("favorites.tab_templates")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="favorites-tab-starred"
                        onPress={() => setActiveTab("starred")}
                        accessibilityLabel={t("favorites.tab_starred")}
                        style={[
                            styles.segment,
                            {
                                borderRadius: borderRadius.lg - 2,
                                backgroundColor:
                                    activeTab === "starred"
                                        ? colors.primary
                                        : "transparent",
                                margin: 3,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                {
                                    color:
                                        activeTab === "starred"
                                            ? colors.textOnAccent
                                            : colors.textSecondary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.semiBold,
                                },
                            ]}
                        >
                            {t("favorites.tab_starred")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* List */}
                {activeTab === "templates" ? (
                    <>
                        {/* Sort toggle */}
                        {templates.length > 1 && (
                            <View
                                style={[
                                    styles.sortRow,
                                    { paddingHorizontal: spacing.lg },
                                ]}
                            >
                                <SortCycleButton
                                    testID="templates-sort-toggle"
                                    value={templateSort}
                                    options={sortOptions}
                                    onChange={setTemplateSort}
                                />
                            </View>
                        )}
                        <FlatList
                            testID="templates-list"
                            data={sortedTemplates}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderTemplate}
                            ListEmptyComponent={renderEmptyTemplates}
                            contentContainerStyle={[
                                styles.listContent,
                                {
                                    paddingHorizontal: spacing.lg,
                                    paddingBottom: spacing.huge,
                                },
                            ]}
                        />
                    </>
                ) : (
                    <FlatList
                        testID="starred-list"
                        data={starredItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderStarred}
                        ListEmptyComponent={renderEmptyStarred}
                        contentContainerStyle={[
                            styles.listContent,
                            {
                                paddingHorizontal: spacing.lg,
                                paddingBottom: spacing.huge,
                            },
                        ]}
                    />
                )}

                {/* FAB — only in templates tab */}
                {activeTab === "templates" && (
                    <TouchableOpacity
                        testID="favorites-add-template-fab"
                        onPress={() => templateFormRef.current?.openAdd()}
                        accessibilityLabel={t("favorites.btn_add")}
                        style={[
                            styles.fab,
                            {
                                backgroundColor: colors.primary,
                                borderRadius: borderRadius.full,
                                bottom: spacing.xl,
                                right: spacing.lg,
                                elevation: 6,
                            },
                        ]}
                    >
                        <Ionicons
                            name="add"
                            size={28}
                            color={colors.textOnAccent}
                        />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <TemplateFormSheet ref={templateFormRef} onSaved={loadData} />
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 4,
    },
    segmentedControl: {
        flexDirection: "row",
        borderWidth: 1,
        overflow: "hidden",
    },
    segment: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    listContent: {
        flexGrow: 1,
        paddingTop: 4,
    },
    sortRow: {
        paddingVertical: 6,
        paddingBottom: 4,
    },
    card: {
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardActions: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
        gap: 6,
    },
    iconBtn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        gap: 8,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyTitle: {
        textAlign: "center",
    },
    emptySubtitle: {
        textAlign: "center",
        paddingHorizontal: 32,
    },
    fab: {
        position: "absolute",
        width: 56,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

