import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { useTheme } from '@/context/AppContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
}

export default function GlassCard({ children, style, intensity = 20, padding = 20, borderRadius = 24 }: GlassCardProps) {
  const theme = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={theme.isDark ? 'dark' : 'light'}
        style={[
          styles.base,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});
