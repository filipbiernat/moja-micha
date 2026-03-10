import React from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from './db';

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

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <DatabaseProvider>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
                        <Tab.Navigator
                            screenOptions={{
                                headerShown: false,
                                tabBarStyle: {
                                    backgroundColor: '#16162A',
                                    borderTopColor: '#1E1E3A',
                                    borderTopWidth: 1,
                                },
                                tabBarActiveTintColor: '#00E5FF',
                                tabBarInactiveTintColor: '#666680',
                                tabBarLabelStyle: {
                                    fontSize: 11,
                                    fontWeight: '600',
                                },
                            }}
                        >
                            <Tab.Screen
                                name="Today"
                                component={TodayScreen}
                                options={{
                                    tabBarLabel: 'Dziś',
                                    tabBarIcon: ({ size }: TabIconProps) => (
                                        <TabIcon emoji="🍽️" size={size} />
                                    ),
                                }}
                            />
                            <Tab.Screen
                                name="History"
                                component={HistoryScreen}
                                options={{
                                    tabBarLabel: 'Historia',
                                    tabBarIcon: ({ size }: TabIconProps) => (
                                        <TabIcon emoji="📅" size={size} />
                                    ),
                                }}
                            />
                            <Tab.Screen
                                name="Favorites"
                                component={FavoritesScreen}
                                options={{
                                    tabBarLabel: 'Ulubione',
                                    tabBarIcon: ({ size }: TabIconProps) => (
                                        <TabIcon emoji="⭐" size={size} />
                                    ),
                                }}
                            />
                            <Tab.Screen
                                name="Stats"
                                component={StatsScreen}
                                options={{
                                    tabBarLabel: 'Statystyki',
                                    tabBarIcon: ({ size }: TabIconProps) => (
                                        <TabIcon emoji="📊" size={size} />
                                    ),
                                }}
                            />
                            <Tab.Screen
                                name="Settings"
                                component={SettingsScreen}
                                options={{
                                    tabBarLabel: 'Ustawienia',
                                    tabBarIcon: ({ size }: TabIconProps) => (
                                        <TabIcon emoji="⚙️" size={size} />
                                    ),
                                }}
                            />
                        </Tab.Navigator>
                    </NavigationContainer>
                </SafeAreaProvider>
            </DatabaseProvider>
        </GestureHandlerRootView>
    );
}
