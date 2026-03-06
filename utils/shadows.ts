import { Platform } from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)},${alpha})`;
}

export function makeShadow(
  color = '#000000',
  offsetY = 4,
  blur = 16,
  opacity = 0.08,
  elevation = 4
): Record<string, unknown> {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${blur}px ${hexToRgba(color, opacity)}` };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

export const shadows = {
  soft: makeShadow('#000000', 4, 16, 0.08, 4),
  medium: makeShadow('#000000', 8, 24, 0.12, 8),
  card: makeShadow('#FF6B6B', 4, 20, 0.15, 6),
  hero: makeShadow('#FF6B6B', 8, 20, 0.25, 10),
  fab: makeShadow('#FF6B6B', 4, 12, 0.4, 8),
  tabBar: makeShadow('#000000', 8, 24, 0.12, 12),
};
