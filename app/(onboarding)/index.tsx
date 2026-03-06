import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { makeShadow } from '@/utils/shadows';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isNative = Platform.OS !== 'web';
const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: isNative }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: isNative }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: isNative }),
    ]).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/profile');
  };

  return (
    <LinearGradient colors={['#FFF8F0', '#FFE8D6', '#FFCBA8']} style={styles.container}>
      {/* Decorative circles */}
      <View style={[styles.decoCircle1]} />
      <View style={[styles.decoCircle2]} />
      <View style={[styles.decoCircle3]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.logo}>
            <Ionicons name="wallet" size={44} color="#fff" />
          </LinearGradient>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={14} color="#FF6B6B" />
          </View>
        </Animated.View>

        <Text style={styles.appName}>Penny</Text>
        <Text style={styles.tagline}>Your money, beautifully{'\n'}organized</Text>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'bar-chart', text: 'Smart spending insights' },
            { icon: 'shield-checkmark', text: 'Track every penny' },
            { icon: 'sparkles', text: 'AI-powered advice' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim, paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
        >
          <LinearGradient colors={['#FF8C69', '#FF6B6B', '#E85555']} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  decoCircle2: {
    position: 'absolute',
    top: 120,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(78,205,196,0.08)',
  },
  decoCircle3: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,140,105,0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 16,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...(makeShadow('#FF6B6B', 8, 20, 0.35, 10) as object),
  },
  logoBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...(makeShadow('#000000', 2, 4, 0.1, 3) as object),
  },
  appName: {
    fontSize: 44,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 22,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  features: {
    gap: 14,
    width: '100%',
    maxWidth: 280,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
  },
  bottom: {
    paddingHorizontal: 32,
    gap: 20,
    alignItems: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 32,
    ...(makeShadow('#FF6B6B', 6, 16, 0.4, 8) as object),
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FF6B6B',
  },
});
