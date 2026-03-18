import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface SortCycleOption<T extends string> {
    value: T;
    label: string;
    icon: IoniconName;
}

interface SortCycleButtonProps<T extends string> {
    value: T;
    options: ReadonlyArray<SortCycleOption<T>>;
    onChange: (value: T) => void;
    testID: string;
}

export function SortCycleButton<T extends string>({
    value,
    options,
    onChange,
    testID,
}: SortCycleButtonProps<T>) {
    const { colors, typography, spacing } = useTheme();
    const currentIndex = options.findIndex((option) => option.value === value);
    const currentOption = options[Math.max(currentIndex, 0)];

    const handlePress = () => {
        const nextIndex = (Math.max(currentIndex, 0) + 1) % options.length;
        onChange(options[nextIndex].value);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                testID={testID}
                onPress={handlePress}
                accessibilityLabel={currentOption.label}
                style={styles.button}
            >
                <Ionicons
                    name={currentOption.icon}
                    size={16}
                    color={colors.primary}
                />
                <Text
                    style={{
                        color: colors.primary,
                        fontSize: typography.fontSize.xs,
                        marginLeft: spacing.xs,
                    }}
                >
                    {currentOption.label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
});
