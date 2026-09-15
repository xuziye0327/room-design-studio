import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: '#2859d6' },
    info: { main: '#087c91' },
    warning: { main: '#9a631c', light: '#fff7e9' },
    background: { default: '#f5f7fb', paper: '#fff' },
    text: { primary: '#17233b', secondary: '#4c5a70' },
    divider: '#e2e8f1',
    action: { selected: '#edf3ff', hover: '#edf3ff65' },
  },
  typography: {
    fontFamily: "'Maple Mono NF CN', 'Microsoft YaHei', monospace",
    fontSize: 16,
    body1: { fontSize: 18, lineHeight: 1.6 },
    h1: { fontWeight: 650, letterSpacing: '-0.04em', lineHeight: 1.25 },
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgb(255 255 255 / 88%)',
          borderRadius: 20,
          backgroundColor: 'rgb(255 255 255 / 64%)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 16px 48px #344c8c0d, inset 0 1px 0 #fff',
          '@media (prefers-reduced-transparency: reduce)': {
            backgroundColor: 'var(--mui-palette-background-paper)',
            backdropFilter: 'none',
            borderColor: 'var(--mui-palette-divider)',
          },
        },
      },
    },
    MuiLink: {
      defaultProps: { color: 'inherit', underline: 'hover' },
    },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          fontSize: 14,
          '@media (max-width: 760px)': { minHeight: 44 },
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          width: 36,
          height: 36,
          borderRadius: 6,
          color: 'var(--mui-palette-text-secondary)',
          '@media (max-width: 760px)': { width: 44, height: 44 },
        },
      },
    },
    MuiToggleButton: {
      defaultProps: { size: 'small', color: 'primary' },
      styleOverrides: {
        root: {
          gap: 7,
          minHeight: 40,
          padding: '8px 11px',
          fontSize: 14,
          '@media (max-width: 760px)': { minHeight: 44, padding: '8px 9px' },
        },
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: { size: 'small', color: 'primary' },
      styleOverrides: { root: { backgroundColor: 'rgb(255 255 255 / 90%)' } },
    },
    MuiCardActionArea: {
      styleOverrides: { root: { '&.Mui-focusVisible': { outlineOffset: -4 } } },
    },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { borderRadius: 5, fontSize: 12, height: 24 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          fontSize: 14,
          variants: [
            {
              props: { severity: 'warning', variant: 'standard' },
              style: {
                backgroundColor: 'var(--mui-palette-warning-light)',
                borderColor: '#ecd9b8',
                color: 'var(--mui-palette-text-primary)',
              },
            },
          ],
        },
        icon: { fontSize: 18 },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true },
      styleOverrides: {
        root: {
          '&::before': { display: 'none' },
          '&:first-of-type, &:last-of-type': { borderRadius: 20 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 14, padding: '11px 16px' },
        head: { fontSize: 13, color: 'var(--mui-palette-text-secondary)' },
      },
    },
  },
})
