import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { makeShadow } from '@/utils/shadows';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROFESSIONS = [
  'Student', 'Employed', 'Self-employed', 'Freelancer',
  'Business Owner', 'Retired', 'Other',
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleNext = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(onboarding)/currency', params: { name: name.trim(), profession } });
  };

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
            <View key={i} style={[styles.progressDot, i === 1 && styles.progressDotActive, i < 1 && styles.progressDotDone]} />
          ))}
        </View>

        <Text style={styles.step}>STEP 1 OF 3</Text>
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>So we can personalize your experience</Text>

        {/* Name Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Your name</Text>
          <View style={[styles.inputWrapper, name.length > 0 && styles.inputWrapperFocused]}>
            <Ionicons name="person-outline" size={18} color={name ? '#FF6B6B' : '#9CA3AF'} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="What should we call you?"
              placeholderTextColor="#C4C4C4"
              maxLength={50}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {name.length > 0 && <Ionicons name="checkmark-circle" size={18} color="#4ECDC4" />}
          </View>
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        {/* Profession */}
        <View style={styles.field}>
          <Text style={styles.label}>Profession</Text>
          <View style={styles.profGrid}>
            {PROFESSIONS.map(p => (
              <Pressable
                key={p}
                onPress={() => { setProfession(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.profChip, profession === p && styles.profChipActive]}
              >
                <Text style={[styles.profChipText, profession === p && styles.profChipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <Pressable
          onPress={handleNext}
          disabled={!name.trim()}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
        >
          <LinearGradient
            colors={name.trim() ? ['#FF8C69', '#FF6B6B'] : ['#E5E7EB', '#D1D5DB']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextBtnText, !name.trim() && { color: '#9CA3AF' }]}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={name.trim() ? '#fff' : '#9CA3AF'} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  progressDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#FF6B6B',
  },
  progressDotDone: {
    backgroundColor: '#4ECDC4',
  },
  step: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF6B6B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginBottom: 32,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...(makeShadow('#000000', 2, 8, 0.04, 2) as object),
  },
  inputWrapperFocused: {
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A2E',
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#C4C4C4',
    textAlign: 'right',
    marginTop: 4,
  },
  profGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  profChipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
  },
  profChipTextActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#FFF8F0',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 32,
    ...(makeShadow('#FF6B6B', 4, 12, 0.3, 6) as object),
  },
  nextBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
