import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { makeShadow } from '@/utils/shadows';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name: string;
    profession: string;
    currencyCode: string;
    currencySymbol: string;
    currencyName: string;
  }>();
  const { completeOnboarding } = useApp();
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const sym = params.currencySymbol || '$';

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLoading(true);
    await completeOnboarding({
      name: params.name || '',
      profession: params.profession || '',
      currency: {
        code: params.currencyCode || 'USD',
        symbol: params.currencySymbol || '$',
        name: params.currencyName || 'US Dollar',
      },
      monthlyBudget: budget ? parseFloat(budget) : 0,
      categoryBudgets: {},
    });
    router.replace('/(tabs)');
    setIsLoading(false);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBudget('0');
    handleFinish();
  };

  const quickAmounts = ['500', '1000', '2000', '5000'];

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.progressDot, i === 3 && styles.progressDotActive, i < 3 && styles.progressDotDone]} />
          ))}
        </View>

        <Text style={styles.step}>STEP 3 OF 3</Text>
        <Text style={styles.title}>Set a budget goal</Text>
        <Text style={styles.subtitle}>How much would you like to spend per month?</Text>

        {/* Budget Input */}
        <View style={styles.budgetInputWrapper}>
          <Text style={styles.currencySymbol}>{sym}</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={t => setBudget(t.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor="#C4C4C4"
            keyboardType="decimal-pad"
            maxLength={8}
          />
        </View>

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {quickAmounts.map(a => (
            <Pressable
              key={a}
              onPress={() => { setBudget(a); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.quickChip, budget === a && styles.quickChipActive]}
            >
              <Text style={[styles.quickChipText, budget === a && styles.quickChipTextActive]}>
                {sym}{a}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.summaryValue}>{params.name || 'You'}</Text>
          </View>
          {params.profession ? (
            <View style={styles.summaryRow}>
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text style={styles.summaryValue}>{params.profession}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.summaryValue}>{params.currencyCode} ({sym})</Text>
          </View>
          {budget ? (
            <View style={styles.summaryRow}>
              <Ionicons name="wallet-outline" size={16} color="#6B7280" />
              <Text style={styles.summaryValue}>{sym}{parseFloat(budget).toLocaleString()} / month</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </Pressable>
        <Pressable
          onPress={handleFinish}
          disabled={isLoading}
          style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
        >
          <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.startBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.startBtnText}>{isLoading ? 'Setting up...' : 'Start Tracking'}</Text>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { paddingHorizontal: 24 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  progressDot: { height: 4, flex: 1, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: '#FF6B6B' },
  progressDotDone: { backgroundColor: '#4ECDC4' },
  step: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#FF6B6B', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#1A1A2E', marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#6B7280', marginBottom: 32 },
  budgetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 40,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
  },
  budgetInput: {
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    minWidth: 100,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
  quickChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  quickChipActive: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  quickChipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#374151' },
  quickChipTextActive: { color: '#fff' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    ...(makeShadow('#000000', 2, 8, 0.06, 3) as object),
  },
  summaryTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryValue: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#374151' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF8F0',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  skipBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 32,
    ...(makeShadow('#FF6B6B', 4, 12, 0.3, 6) as object),
  },
  startBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
});
