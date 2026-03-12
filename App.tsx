import React from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from './db';
import { ThemeProvider, useTheme } from './theme';
import { LanguageProvider } from './i18n/LanguageProvider';
import { useTranslation } from 'react-i18next';
import './i18n'; // Inicjalizacja i18next

import TodayScreen from './app/screens/TodayScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import FavoritesScreen from './app/screens/FavoritesScreen';
import StatsScreen from './app/screens/StatsScreen';
import SettingsScreen from './app/screens/SettingsScreen';

type TabIconProps = {
    color: string;
    size: number;
};

const TabIcon = ({ emoji, size }: { emoji: string; size: number }) => (
    <Text style={{ fontSize: size }}>{emoji}</Text>
);

const Tab = createBottomTabNavigator();

// ─── Inner navigator — has access to ThemeProvider context ────────────────────

function AppNavigator() {
    const { colors, typography } = useTheme();
    const { t } = useTranslation();

    return (
        <>
            <StatusBar
                barStyle={colors.statusBarStyle}
                backgroundColor={colors.statusBar}
            />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.tabBarBackground,
                        borderTopColor: colors.tabBarBorder,
                        borderTopWidth: 1,
                    },
                    tabBarActiveTintColor: colors.tabBarActive,
                    tabBarInactiveTintColor: colors.tabBarInactive,
                    tabBarLabelStyle: {
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semiBold,
                    },
                }}
            >
                <Tab.Screen
                    name="Today"
                    component={TodayScreen}
                    options={{
                        tabBarLabel: t('tabs.today'),
                        tabBarIcon: ({ size }: TabIconProps) => (
                            <TabIcon emoji="🍽️" size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        tabBarLabel: t('tabs.history'),
                        tabBarIcon: ({ size }: TabIconProps) => (
                            <TabIcon emoji="📅" size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                    options={{
                        tabBarLabel: t('tabs.favorites'),
                        tabBarIcon: ({ size }: TabIconProps) => (
                            <TabIcon emoji="⭐" size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Stats"
                    component={StatsScreen}
                    options={{
                        tabBarLabel: t('tabs.stats'),
                        tabBarIcon: ({ size }: TabIconProps) => (
                            <TabIcon emoji="📊" size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        tabBarLabel: t('tabs.settings'),
                        tabBarIcon: ({ size }: TabIconProps) => (
                            <TabIcon emoji="⚙️" size={size} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <DatabaseProvider>
                <SafeAreaProvider>
                    <LanguageProvider>
                        <ThemeProvider>
                            <NavigationContainer>
                                <AppNavigator />
                            </NavigationContainer>
                        </ThemeProvider>
                    </LanguageProvider>
                </SafeAreaProvider>
            </DatabaseProvider>
        </GestureHandlerRootView>
    );
}
