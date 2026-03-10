import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.title}>Ulubione</Text>
            <Text style={styles.subtitle}>Szablony i oznaczone posiłki</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00E5FF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.6,
    },
});
