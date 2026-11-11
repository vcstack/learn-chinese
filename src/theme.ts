import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { Theme as NavigationTheme } from '@react-navigation/native';

/**
 * Theme duy nhất của app — React Native Paper (Material Design 3) với màu
 * chủ đạo xanh lá. Mọi màn hình đều lấy màu/chữ từ đây, không hard-code
 * màu lung tung trong từng component.
 */

// ---------------------------------------------------------------------------
// Bảng màu thương hiệu (xanh lá)
// ---------------------------------------------------------------------------
export const brand = {
  green900: '#052E16',
  green800: '#14532D',
  green700: '#15803D', // primary
  green600: '#16A34A',
  green500: '#22C55E',
  green100: '#DCFCE7', // primaryContainer
  green50: '#F0FDF4', // surfaceVariant
  amber700: '#B45309',
  amber600: '#D97706', // tertiary
  amber100: '#FEF3C7', // tertiaryContainer
  red600: '#DC2626',
  red50: '#FEF2F2',
  ink: '#111827', // onSurface / onBackground
  muted: '#6B7280', // onSurfaceVariant
  line: '#E5E7EB', // outlineVariant
  appBg: '#F7F8F7', // background
  card: '#FFFFFF', // surface
} as const;

// ---------------------------------------------------------------------------
// Paper theme (MD3)
// ---------------------------------------------------------------------------
export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.green700,
    primaryContainer: brand.green100,
    onPrimary: '#FFFFFF',
    onPrimaryContainer: brand.green900,
    secondary: brand.green600,
    secondaryContainer: '#BBF7D0',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: brand.green900,
    tertiary: brand.amber600,
    tertiaryContainer: brand.amber100,
    onTertiary: '#FFFFFF',
    onTertiaryContainer: brand.amber700,
    background: brand.appBg,
    surface: brand.card,
    surfaceVariant: brand.green50,
    surfaceDisabled: 'rgba(17, 24, 39, 0.12)',
    onSurface: brand.ink,
    onSurfaceVariant: brand.muted,
    onSurfaceDisabled: 'rgba(17, 24, 39, 0.38)',
    onBackground: brand.ink,
    error: brand.red600,
    errorContainer: brand.red50,
    onError: '#FFFFFF',
    onErrorContainer: '#7F1D1D',
    outline: '#D1D5DB',
    outlineVariant: brand.line,
    inverseSurface: '#1F2937',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#86EFAC',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(17, 24, 39, 0.4)',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#F8FAF8',
      level2: '#F3F8F3',
      level3: '#EDF5ED',
      level4: '#EAF3EA',
      level5: '#E7F1E7',
    },
  },
};

// ---------------------------------------------------------------------------
// Bán kính bo + khoảng cách dùng chung (để Card/Button/FAB đồng bộ)
// ---------------------------------------------------------------------------
export const radii = {
  card: 16,
  button: 12,
  chip: 20,
  fab: 28,
  badge: 24,
  hero: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// ---------------------------------------------------------------------------
// React Navigation theme — suy ra từ Paper theme để header/stack đồng bộ
// ---------------------------------------------------------------------------
export const navigationTheme: NavigationTheme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.primary,
    text: '#FFFFFF',
    border: theme.colors.outlineVariant,
    notification: theme.colors.error,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};
