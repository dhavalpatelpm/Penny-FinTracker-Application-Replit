import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useColorScheme,
} from 'react-native';
import { Tabs, router } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/AppContext';

const TAB_CONFIG = [
  { name: 'index', icon: 'home-outline' as const, iconFocused: 'home' as const, label: 'Home' },
  { name: 'analytics', icon: 'bar-chart-outline' as const, iconFocused: 'bar-chart' as const, label: 'Analytics' },
  { name: 'budget', icon: 'wallet-outline' as const, iconFocused: 'wallet' as const, label: 'Budget' },
  { name: 'ai', icon: 'sparkles-outline' as const, iconFocused: 'sparkles' as const, label: 'AI' },
];

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleTabPress = useCallback((routeName: string, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  }, [navigation]);

  const handleAddPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-transaction');
  }, []);

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 8);

  const routes = state.routes.filter(r => TAB_CONFIG.some(t => t.name === r.name));

  const leftTabs = routes.slice(0, 2);
  const rightTabs = routes.slice(2, 4);

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View style={styles.tabBarWrapper}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.blurBackground, { borderColor: theme.tabBarBorder }]}
          />
        ) : (
          <View style={[styles.blurBackground, { backgroundColor: theme.tabBar, borderColor: theme.tabBarBorder }]} />
        )}

        <View style={styles.tabRow}>
          {leftTabs.map((route) => {
            const config = TAB_CONFIG.find(t => t.name === route.name);
            if (!config) return null;
            const isFocused = state.index === state.routes.indexOf(route);
            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.name, isFocused)}
                style={styles.tabItem}
                accessibilityRole="button"
                accessibilityLabel={config.label}
              >
                <Ionicons
                  name={isFocused ? config.iconFocused : config.icon}
                  size={24}
                  color={isFocused ? theme.tabActive : theme.tabInactive}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? theme.tabActive : theme.tabInactive }]}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.fabSlot}>
            <Pressable
              onPress={handleAddPress}
              style={({ pressed }) => [styles.fab, { transform: [{ scale: pressed ? 0.93 : 1 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Add Transaction"
            >
              <LinearGradient
                colors={['#FF8C69', '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>

          {rightTabs.map((route) => {
            const config = TAB_CONFIG.find(t => t.name === route.name);
            if (!config) return null;
            const isFocused = state.index === state.routes.indexOf(route);
            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.name, isFocused)}
                style={styles.tabItem}
                accessibilityRole="button"
                accessibilityLabel={config.label}
              >
                <Ionicons
                  name={isFocused ? config.iconFocused : config.icon}
                  size={24}
                  color={isFocused ? theme.tabActive : theme.tabInactive}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? theme.tabActive : theme.tabInactive }]}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabBarWrapper: {
    width: '100%',
    maxWidth: 500,
    height: 64,
    borderRadius: 32,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  fabSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="budget" />
      <Tabs.Screen name="ai" />
    </Tabs>
  );
}
