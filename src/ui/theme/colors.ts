import chalk from 'chalk';

export const colorPalette = {
  primary: '#6bc8d4',
  secondary: '#00a9c5',
  tertiary: '#ebfdff',
  highlight: '#fcfcd4',
  success: '#56bf80',
  warning: '#f9f871',
  error: '#a33f00',
  info: '#58b1d7',
} as const;

export const colors = {
  primary: chalk.hex(colorPalette.primary),
  secondary: chalk.hex(colorPalette.secondary),
  tertiary: chalk.hex(colorPalette.tertiary),
  highlight: chalk.hex(colorPalette.highlight),
  success: chalk.hex(colorPalette.success),
  warning: chalk.hex(colorPalette.warning),
  error: chalk.hex(colorPalette.error),
  info: chalk.hex(colorPalette.info),
} as const;

export const statusColors = {
  merged: chalk.hex(colorPalette.success),
  closed: chalk.hex(colorPalette.error),
  open: chalk.hex(colorPalette.info),
  draft: chalk.hex(colorPalette.warning),
} as const;

export type ColorPalette = typeof colorPalette;
export type Colors = typeof colors;
export type StatusColors = typeof statusColors;
