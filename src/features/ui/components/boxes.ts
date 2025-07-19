import boxen from 'boxen';

import { colorPalette } from '../theme';

export function printBox(title: string, content: string) {
  const box = boxen(content, {
    title,
    borderStyle: 'round',
    borderColor: colorPalette.primary,
    padding: 1,
    margin: 1,
    titleAlignment: 'center',
  });

  console.log(box);
}
