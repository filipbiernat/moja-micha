import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorTokens } from './colors';
import { typography, spacing, borderRadius, shadows } from './tokens';
import { useDatabase } from '../db';
import { getSetting, setSetting } from '../db/settings';
import { SETTING_KEYS } from '../db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * User-configurable theme preference stored in the database.
 * - 'dark'   → always use dark theme (Fitness Neon)
 * - 'light'  → always use light theme (Fresh & Vibrant)
 * - 'system' → follow the OS color scheme (default)
 */
export type ThemePreference = 'dark' | 'light' | 'system';

export interface Theme {
    colors: ColorTokens;
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    /** The resolved scheme — always 'dark' or 'light', never 'system'. */
    resolvedScheme: 'dark' | 'light';
    /** The value saved to settings — may be 'system'. */
    preference: ThemePreference;
    /** Change and persist the user's preference. */
    setPreference: (pref: ThemePreference) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Theme | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
    children: React.ReactNode;
}

const VALID_PREFS = new Set<string>(['dark', 'light', 'system']);

export function ThemeProvider({ children }: ThemeProviderProps) {
    const db = useDatabase();
    const systemScheme = useColorScheme(); // 'dark' | 'light' | null

    // Default to 'system'
    const [preference, setPreferenceState] = useState<ThemePreference>('system');

    // Read persisted preference asynchronously
    useEffect(() => {
        try {
            const saved = getSetting(db, SETTING_KEYS.THEME);
            if (saved && VALID_PREFS.has(saved)) {
                setPreferenceState(saved as ThemePreference);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    }, [db]);

    // Resolve the actual scheme to use
    const resolvedScheme = useMemo<'dark' | 'light'>(() => {
        if (preference === 'system') {
            return systemScheme === 'light' ? 'light' : 'dark'; // default to dark when null
        }
        return preference;
    }, [preference, systemScheme]);

    const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

    // Persist and apply new preference
    const setPreference = useCallback(
        (pref: ThemePreference) => {
            setPreferenceState(pref);
            setSetting(db, SETTING_KEYS.THEME, pref);
        },
        [db],
    );

    const theme = useMemo<Theme>(
        () => ({
            colors,
            typography,
            spacing,
            borderRadius,
            shadows,
            resolvedScheme,
            preference,
            setPreference,
        }),
        [colors, resolvedScheme, preference, setPreference],
    );

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the current theme inside any component.
 * Must be used within a <ThemeProvider>.
 */
export function useTheme(): Theme {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a <ThemeProvider>');
    }
    return ctx;
}
