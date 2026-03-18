import React, { createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import migrations from '../drizzle/migrations';
import i18n from '../i18n';

// ─── Database instance (singleton) ───────────────────────────

const expo = SQLite.openDatabaseSync('moja-micha.db');
const db = drizzle(expo);

// ─── Context ─────────────────────────────────────────────────

const DatabaseContext = createContext<ExpoSQLiteDatabase | null>(null);

interface DatabaseProviderProps {
    children: React.ReactNode;
}

/**
 * Wraps the app with Drizzle database context.
 * Runs migrations automatically on first render.
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
    const { success, error } = useMigrations(db, migrations);

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{i18n.t('db.error_title')}</Text>
                <Text style={styles.errorDetail}>{error.message}</Text>
            </View>
        );
    }

    if (!success) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00E5FF" />
                <Text style={styles.loadingText}>{i18n.t('db.loading_text')}</Text>
            </View>
        );
    }

    return (
        <DatabaseContext.Provider value={db}>
            {children}
        </DatabaseContext.Provider>
    );
}

/**
 * Hook to access the Drizzle database instance.
 * Must be used within a <DatabaseProvider>.
 */
export function useDatabase(): ExpoSQLiteDatabase {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabase must be used within a <DatabaseProvider>');
    }
    return context;
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1A',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 16,
        fontSize: 16,
        opacity: 0.7,
    },
    errorText: {
        color: '#FF6B35',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorDetail: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
});
