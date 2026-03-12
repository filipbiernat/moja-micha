import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface PlaceholderScreenProps {
    emoji: string;
    title: string;
    subtitle: string;
}

export function PlaceholderScreen({ emoji, title, subtitle }: PlaceholderScreenProps) {
    const { colors, typography } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.title, { color: colors.primary, fontSize: typography.fontSize.xxxl }]}>
                {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.fontSize.lg }]}>
                {subtitle}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        opacity: 0.8,
        textAlign: 'center',
    },
});
