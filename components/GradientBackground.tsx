import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/AppContext';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GradientBackground({ children, style }: Props) {
  const theme = useTheme();

  if (!theme.isDark) {
    return (
      <View style={[styles.base, { backgroundColor: theme.background }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.base, style]}>
      <LinearGradient
        colors={theme.backgroundGradient as [string, string, ...string[]]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={theme.glowGradient as [string, string, ...string[]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
