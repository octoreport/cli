import boxen from 'boxen';

export function createBox(title: string, content: string) {
  return boxen(content, {
    title,
    borderStyle: 'round',
    borderColor: '#000000',
    fullscreen: (width, height) => [width, height],
    padding: 1,
    margin: 1,
    titleAlignment: 'center',
    backgroundColor: '#000000',
  });
}
