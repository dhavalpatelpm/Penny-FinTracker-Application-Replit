import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/AppContext';
import { makeShadow } from '@/utils/shadows';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
}

const cardShadow = makeShadow('#000000', 4, 16, 0.08, 4);

export default function GlassCard({ children, style, intensity = 20, padding = 20, borderRadius = 24 }: GlassCardProps) {
  const theme = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={theme.isDark ? 'dark' : 'light'}
        style={[
          styles.base,
          cardShadow as ViewStyle,
          {
            borderRadius,
            borderColor: theme.glassBorder,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <View style={{ padding }}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        cardShadow as ViewStyle,
        {
          backgroundColor: theme.card,
          borderRadius,
          borderColor: theme.glassBorder,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
