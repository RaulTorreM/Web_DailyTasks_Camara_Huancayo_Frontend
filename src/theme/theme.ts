import { alpha, createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { applyColorMode, brand, colors, sans, serif, shadow } from './tokens';

/**
 * Tema único de la aplicación. Se reconstruye al cambiar de modo.
 */
export function createAppTheme(mode: PaletteMode) {
  applyColorMode(mode);
  const dark = mode === 'dark';
  const primaryMain = dark ? '#8B8DFF' : brand.indigo;
  const primaryDark = dark ? '#6F71E8' : brand.navy;
  const primaryLight = dark ? '#A5A7FF' : '#3C3FA6';
  const onColor = dark ? brand.navyDeep : '#FFFFFF';

  return createTheme({
  palette: {
    mode,
    primary: { main: primaryMain, dark: primaryDark, light: primaryLight, contrastText: onColor },
    secondary: { main: brand.gold, dark: '#8F7600', light: brand.goldLight, contrastText: brand.navy },
    background: { default: colors.bg, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.textSecondary, disabled: colors.textMuted },
    divider: colors.border,
    success: { main: colors.success, light: colors.successSoft, contrastText: onColor },
    warning: { main: colors.warning, light: colors.warningSoft, contrastText: onColor },
    error: { main: colors.error, light: colors.errorSoft, contrastText: onColor },
    info: { main: colors.info, light: colors.infoSoft, contrastText: onColor },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: sans,
    h1: {
      fontSize: 'clamp(1.65rem, 1.25rem + 1.6vw, 2.2rem)',
      fontWeight: 800,
      lineHeight: 1.15,
      letterSpacing: '-0.032em',
      color: colors.text,
    },
    h2: { fontSize: 'clamp(1.4rem, 1.15rem + 1vw, 1.75rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.025em', color: colors.text },
    h3: { fontSize: 'clamp(1.2rem, 1.05rem + 0.6vw, 1.45rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: colors.text },
    h4: { fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', color: colors.text },
    h5: { fontSize: '1.06rem', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.012em', color: colors.text },
    h6: { fontSize: '0.97rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.008em', color: colors.text },
    subtitle1: { fontSize: '0.97rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.84rem', fontWeight: 700 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.86rem', lineHeight: 1.55 },
    caption: { fontSize: '0.76rem', lineHeight: 1.45 },
    overline: { fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.09em', lineHeight: 1.6 },
    button: { fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%' },
        body: {
          backgroundColor: colors.bg,
          color: colors.text,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': { backgroundColor: alpha(brand.gold, 0.3) },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: colors.borderStrong,
          borderRadius: 999,
          border: `3px solid ${colors.bg}`,
        },
        ':focus-visible': { outline: `2px solid ${alpha(primaryMain, 0.55)}`, outlineOffset: 2 },
        // Los documentos imprimibles conservan su aire institucional.
        '.documento h4, .documento h5, .documento h6': { fontFamily: serif },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          minHeight: 44,
          paddingInline: 18,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        },
        sizeSmall: { minHeight: 36, paddingInline: 14, borderRadius: 10, fontSize: '0.82rem' },
        sizeLarge: { minHeight: 50, fontSize: '0.98rem', paddingInline: 24 },
        containedPrimary: { boxShadow: '0 10px 20px -14px rgba(29, 31, 110, 0.9)' },
        containedSecondary: { boxShadow: '0 10px 20px -14px rgba(186, 153, 7, 0.9)' },
        outlined: { borderColor: colors.borderStrong },
        text: { paddingInline: 12 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 12, color: 'inherit' },
        sizeSmall: { borderRadius: 10 },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderColor: colors.border,
          borderRadius: 16,
          boxShadow: shadow.card,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        outlined: { borderColor: colors.border },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.text,
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: { root: { minHeight: 60, '@media (min-width:600px)': { minHeight: 64 } } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: colors.surface,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderStrong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: primaryMain,
          },
        },
        input: { fontSize: 16, padding: '13px 14px' },
        inputSizeSmall: { padding: '9px 12px', fontSize: 15 },
        inputMultiline: { padding: '13px 14px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 15 }, sizeSmall: { fontSize: 14 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, height: 28 },
        outlined: { borderColor: colors.borderStrong, backgroundColor: colors.surface },
        sizeSmall: { height: 24, fontSize: '0.74rem' },
        label: { paddingInline: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundImage: 'none',
          boxShadow: shadow.raised,
          margin: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 800, fontSize: '1.08rem', padding: '22px 24px 8px' } },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '12px 24px 8px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(12, 12, 46, 0.46)', backdropFilter: 'blur(2px)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 999, backgroundColor: colors.bgSubtle },
        bar: { borderRadius: 999 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 46 },
        indicator: { height: 3, borderRadius: 3, backgroundColor: brand.gold },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          minHeight: 46,
          color: colors.textSecondary,
          '&.Mui-selected': { color: primaryMain },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': { backgroundColor: alpha(primaryMain, 0.08) },
          '&.Mui-selected:hover': { backgroundColor: alpha(primaryMain, 0.12) },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderColor: colors.borderStrong,
          color: colors.textSecondary,
          '&.Mui-selected': {
            color: primaryMain,
            backgroundColor: alpha(primaryMain, 0.08),
            borderColor: alpha(primaryMain, 0.4),
          },
          '&.Mui-selected:hover': { backgroundColor: alpha(primaryMain, 0.12) },
        },
      },
    },
    MuiFab: {
      styleOverrides: { root: { boxShadow: shadow.raised } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, alignItems: 'center' },
        message: { paddingBlock: 2 },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: { root: { backgroundColor: alpha(primaryMain, 0.06), borderRadius: 12 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: brand.navy,
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '8px 10px',
          fontWeight: 600,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: shadow.raised, border: `1px solid ${colors.border}` },
        option: { borderRadius: 8, marginInline: 4 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: shadow.raised, border: `1px solid ${colors.border}`, marginTop: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 8, marginInline: 6, fontSize: '0.9rem' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 800, color: colors.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { backgroundColor: alpha(primaryMain, 0.1), color: primaryMain, fontWeight: 800 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: colors.border } } },
    MuiSnackbar: { defaultProps: { anchorOrigin: { vertical: 'top', horizontal: 'center' } } },
  },
  });
}

export default createAppTheme('light');
