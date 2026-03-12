/**
 * Theme barrel export.
 * Import everything theme-related from here.
 *
 * Usage:
 *   import { useTheme, ThemeProvider, darkColors, lightColors } from '../theme';
 */

export { darkColors, lightColors } from './colors';
export type { ColorTokens } from './colors';

export { typography, spacing, borderRadius, shadows } from './tokens';

export { ThemeProvider, useTheme } from './ThemeContext';
export type { Theme, ThemePreference } from './ThemeContext';
