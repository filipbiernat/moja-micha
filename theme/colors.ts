/**
 * Color tokens for Moja Micha app.
 *
 * Dark Theme:  "Fitness Neon"   — dark background, cyan + orange accents
 * Light Theme: "Fresh & Vibrant" — light background, coral + teal accents
 */

export interface ColorTokens {
    background: string;
    surface: string;
    surfaceElevated: string;
    surfaceHighlight: string;
    primary: string;
    primaryMuted: string;
    secondary: string;
    secondaryMuted: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textDisabled: string;
    textOnAccent: string;
    border: string;
    borderStrong: string;
    divider: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    statusBar: string;
    statusBarStyle: 'light-content' | 'dark-content';
    streak: string;
    star: string;
    progressBar: string;
    progressBarBackground: string;
    inputBackground: string;
    inputBorder: string;
    inputBorderFocus: string;
    inputPlaceholder: string;
    card: string;
    cardPressed: string;
}

// ─── Dark Theme: Fitness Neon ─────────────────────────────────────────────────

export const darkColors: ColorTokens = {
    // Background layers
    background: '#0F0F1A',
    surface: '#16162A',
    surfaceElevated: '#1E1E3A',
    surfaceHighlight: '#252545',

    // Accents
    primary: '#00E5FF',       // Cyan – main accent
    primaryMuted: '#00B8CC',  // Cyan – muted variant
    secondary: '#FF6B35',     // Orange – secondary accent
    secondaryMuted: '#CC5528',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0CC',
    textMuted: '#666680',
    textDisabled: '#3A3A5C',
    textOnAccent: '#0F0F1A',

    // Borders & dividers
    border: '#1E1E3A',
    borderStrong: '#2E2E50',
    divider: '#1A1A30',

    // Semantic colors
    success: '#00E676',
    warning: '#FFD740',
    error: '#FF5252',
    info: '#40C4FF',

    // Tab bar
    tabBarBackground: '#16162A',
    tabBarBorder: '#1E1E3A',
    tabBarActive: '#00E5FF',
    tabBarInactive: '#666680',

    // Status bar
    statusBar: '#0F0F1A',
    statusBarStyle: 'light-content',

    // Streak & special
    streak: '#FF6B35',
    star: '#FFD740',
    progressBar: '#00E5FF',
    progressBarBackground: '#1E1E3A',

    // Input fields
    inputBackground: '#1E1E3A',
    inputBorder: '#2E2E50',
    inputBorderFocus: '#00E5FF',
    inputPlaceholder: '#3A3A5C',

    // Card / list item
    card: '#16162A',
    cardPressed: '#1E1E3A',
};

// ─── Light Theme: Fresh & Vibrant ─────────────────────────────────────────────

export const lightColors: ColorTokens = {
    // Background layers
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F1F3',
    surfaceHighlight: '#E8E9EC',

    // Accents
    primary: '#FF6B6B',       // Coral – main accent
    primaryMuted: '#E05555',
    secondary: '#4ECDC4',     // Teal – secondary accent
    secondaryMuted: '#3BA8A0',

    // Text
    textPrimary: '#1A1A2E',
    textSecondary: '#4A4A6A',
    textMuted: '#8888AA',
    textDisabled: '#CCCCDD',
    textOnAccent: '#FFFFFF',

    // Borders & dividers
    border: '#E0E0EC',
    borderStrong: '#C8C8DC',
    divider: '#EBEBF5',

    // Semantic colors
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',

    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E0E0EC',
    tabBarActive: '#FF6B6B',
    tabBarInactive: '#8888AA',

    // Status bar
    statusBar: '#F8F9FA',
    statusBarStyle: 'dark-content',

    // Streak & special
    streak: '#FF6B35',
    star: '#F39C12',
    progressBar: '#FF6B6B',
    progressBarBackground: '#E0E0EC',

    // Input fields
    inputBackground: '#FFFFFF',
    inputBorder: '#E0E0EC',
    inputBorderFocus: '#FF6B6B',
    inputPlaceholder: '#CCCCDD',

    // Card / list item
    card: '#FFFFFF',
    cardPressed: '#F0F1F3',
};
