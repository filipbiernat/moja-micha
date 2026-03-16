import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayView } from "../../components/DayView";
import { MealFormSheet } from "../../components/MealFormSheet";
import type { MealFormSheetHandle } from "../../components/MealFormSheet";
import type { Meal } from "../../db/schema";
import { useTheme } from "../../theme";
import { getLocalDateString } from "../../utils";

export default function TodayScreen() {
    const { t } = useTranslation();
    const { colors, spacing, borderRadius, shadows } = useTheme();

    const [currentDate, setCurrentDate] = useState(getLocalDateString);
    const [refreshKey, setRefreshKey] = useState(0);

    const formSheetRef = useRef<MealFormSheetHandle>(null);

    useFocusEffect(
        useCallback(() => {
            setCurrentDate(getLocalDateString());
        }, []),
    );

    const handleOpenAdd = () => {
        formSheetRef.current?.openAdd(currentDate);
    };

    const handleEditMeal = useCallback((meal: Meal) => {
        formSheetRef.current?.openEdit(meal);
    }, []);

    const handleSaved = useCallback((savedDate: string) => {
        setCurrentDate(savedDate);
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <DayView
                date={currentDate}
                onDateChange={setCurrentDate}
                reloadKey={refreshKey}
                onMealPress={handleEditMeal}
            />

            <TouchableOpacity
                accessibilityLabel={t("today.quick_entry_open")}
                activeOpacity={0.9}
                onPress={handleOpenAdd}
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

            <MealFormSheet
                ref={formSheetRef}
                onSaved={handleSaved}
            />
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
});
