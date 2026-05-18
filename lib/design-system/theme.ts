// Color scale interface for consistent color definitions
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Semantic colors for consistent meaning across themes
export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

// Typography system configuration
export interface TypographySystem {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

// Animation configuration for micro-interactions
export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
  reducedMotion: boolean;
}

// Complete theme configuration interface
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    border: string;
    input: string;
    ring: string;
  };
  spacing: Record<string, string>;
  typography: TypographySystem;
  animations: AnimationConfig;
}

// Primary brand color scale (Yellow)
export const primaryColors: ColorScale = {
  50: '#fefce8',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#ca8a04', // Primary brand color
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
  950: '#422006',
};

// Secondary color scale (Blue for accents)
export const secondaryColors: ColorScale = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

// Neutral color scale (Gray)
export const neutralColors: ColorScale = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
};

// Semantic colors for consistent meaning
export const semanticColors: SemanticColors = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
};

// Typography system configuration
export const typography: TypographySystem = {
  fontFamily: {
    sans: ['Arial', 'Helvetica', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Animation configuration
export const animations: AnimationConfig = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  reducedMotion: false, // Will be set based on user preference
};

// Light theme configuration
export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    neutral: neutralColors,
    semantic: semanticColors,
    background: '#ffffff',
    foreground: '#171717',
    muted: '#f3f4f6',
    accent: '#ca8a04',
    border: '#e5e7eb',
    input: '#ffffff',
    ring: 'rgba(202, 138, 4, 0.3)',
  },
  spacing: {}, // Will be populated from spacing system
  typography,
  animations,
};

// Dark theme configuration
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    neutral: neutralColors,
    semantic: semanticColors,
    background: '#0a0a0a',
    foreground: '#ededed',
    muted: '#1f2937',
    accent: '#fbbf24', // Lighter yellow for dark mode
    border: '#374151',
    input: '#1f2937',
    ring: 'rgba(251, 191, 36, 0.3)',
  },
  spacing: {}, // Will be populated from spacing system
  typography,
  animations,
};

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// CSS variables generator for themes
export function generateThemeCSSVariables(theme: ThemeConfig): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Background and foreground
  variables['--background'] = theme.colors.background;
  variables['--foreground'] = theme.colors.foreground;
  variables['--muted'] = theme.colors.muted;
  variables['--accent'] = theme.colors.accent;
  variables['--border'] = theme.colors.border;
  variables['--input'] = theme.colors.input;
  variables['--ring'] = theme.colors.ring;
  
  // Primary color scale
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    variables[`--color-primary-${key}`] = value;
  });
  
  // Secondary color scale
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    variables[`--color-secondary-${key}`] = value;
  });
  
  // Neutral color scale
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    variables[`--color-neutral-${key}`] = value;
  });
  
  // Semantic colors
  Object.entries(theme.colors.semantic).forEach(([semanticKey, colorScale]) => {
    Object.entries(colorScale as ColorScale).forEach(([scaleKey, value]) => {
      variables[`--color-${semanticKey}-${scaleKey}`] = value;
    });
  });
  
  // Typography variables
  variables['--font-sans'] = theme.typography.fontFamily.sans.join(', ');
  variables['--font-mono'] = theme.typography.fontFamily.mono.join(', ');
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value;
  });
  
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    variables[`--line-height-${key}`] = value;
  });
  
  // Animation variables
  Object.entries(theme.animations.duration).forEach(([key, value]) => {
    variables[`--duration-${key}`] = value;
  });
  
  Object.entries(theme.animations.easing).forEach(([key, value]) => {
    variables[`--easing-${key}`] = value;
  });
  
  return variables;
}

// Generate CSS string from variables
export function generateCSSString(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

// Get system theme preference
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Get reduced motion preference
export function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Theme utilities
export const themeUtils = {
  // Get current theme based on mode
  getCurrentTheme: (mode: ThemeMode): ThemeConfig => {
    if (mode === 'system') {
      return getSystemTheme() === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  },
  
  // Toggle between light and dark
  toggleTheme: (currentMode: ThemeMode): ThemeMode => {
    if (currentMode === 'system') return 'light';
    return currentMode === 'light' ? 'dark' : 'light';
  },
  
  // Check if theme is dark
  isDark: (theme: ThemeConfig): boolean => {
    return theme.mode === 'dark' || 
           (theme.mode === 'system' && getSystemTheme() === 'dark');
  },
  
  // Get contrast color for accessibility
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation - in production, use a proper contrast library
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },
};

// Export default themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// Theme configuration for Tailwind CSS
export const tailwindThemeConfig = {
  colors: {
    // CSS variable references for Tailwind
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    
    // Primary colors
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
      950: 'var(--color-primary-950)',
      DEFAULT: 'var(--color-primary-600)',
    },
    
    // Secondary colors
    secondary: {
      50: 'var(--color-secondary-50)',
      100: 'var(--color-secondary-100)',
      200: 'var(--color-secondary-200)',
      300: 'var(--color-secondary-300)',
      400: 'var(--color-secondary-400)',
      500: 'var(--color-secondary-500)',
      600: 'var(--color-secondary-600)',
      700: 'var(--color-secondary-700)',
      800: 'var(--color-secondary-800)',
      900: 'var(--color-secondary-900)',
      950: 'var(--color-secondary-950)',
      DEFAULT: 'var(--color-secondary-600)',
    },
    
    // Neutral colors
    neutral: {
      50: 'var(--color-neutral-50)',
      100: 'var(--color-neutral-100)',
      200: 'var(--color-neutral-200)',
      300: 'var(--color-neutral-300)',
      400: 'var(--color-neutral-400)',
      500: 'var(--color-neutral-500)',
      600: 'var(--color-neutral-600)',
      700: 'var(--color-neutral-700)',
      800: 'var(--color-neutral-800)',
      900: 'var(--color-neutral-900)',
      950: 'var(--color-neutral-950)',
      DEFAULT: 'var(--color-neutral-500)',
    },
    
    // Semantic colors
    success: {
      50: 'var(--color-success-50)',
      100: 'var(--color-success-100)',
      200: 'var(--color-success-200)',
      300: 'var(--color-success-300)',
      400: 'var(--color-success-400)',
      500: 'var(--color-success-500)',
      600: 'var(--color-success-600)',
      700: 'var(--color-success-700)',
      800: 'var(--color-success-800)',
      900: 'var(--color-success-900)',
      950: 'var(--color-success-950)',
      DEFAULT: 'var(--color-success-600)',
    },
    
    warning: {
      50: 'var(--color-warning-50)',
      100: 'var(--color-warning-100)',
      200: 'var(--color-warning-200)',
      300: 'var(--color-warning-300)',
      400: 'var(--color-warning-400)',
      500: 'var(--color-warning-500)',
      600: 'var(--color-warning-600)',
      700: 'var(--color-warning-700)',
      800: 'var(--color-warning-800)',
      900: 'var(--color-warning-900)',
      950: 'var(--color-warning-950)',
      DEFAULT: 'var(--color-warning-600)',
    },
    
    error: {
      50: 'var(--color-error-50)',
      100: 'var(--color-error-100)',
      200: 'var(--color-error-200)',
      300: 'var(--color-error-300)',
      400: 'var(--color-error-400)',
      500: 'var(--color-error-500)',
      600: 'var(--color-error-600)',
      700: 'var(--color-error-700)',
      800: 'var(--color-error-800)',
      900: 'var(--color-error-900)',
      950: 'var(--color-error-950)',
      DEFAULT: 'var(--color-error-600)',
    },
    
    info: {
      50: 'var(--color-info-50)',
      100: 'var(--color-info-100)',
      200: 'var(--color-info-200)',
      300: 'var(--color-info-300)',
      400: 'var(--color-info-400)',
      500: 'var(--color-info-500)',
      600: 'var(--color-info-600)',
      700: 'var(--color-info-700)',
      800: 'var(--color-info-800)',
      900: 'var(--color-info-900)',
      950: 'var(--color-info-950)',
      DEFAULT: 'var(--color-info-600)',
    },
  },
  
  fontFamily: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
  },
  
  fontWeight: {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  },
  
  lineHeight: {
    tight: 'var(--line-height-tight)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
  
  transitionDuration: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  },
  
  transitionTimingFunction: {
    linear: 'var(--easing-linear)',
    'ease-in': 'var(--easing-easeIn)',
    'ease-out': 'var(--easing-easeOut)',
    'ease-in-out': 'var(--easing-easeInOut)',
    bounce: 'var(--easing-bounce)',
  },
};