import React, { useState, useCallback } from 'react';
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
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '@/context/AppContext';
import GradientBackground from '@/components/GradientBackground';
import CategoryIcon from '@/components/CategoryIcon';
import { getCategoryById } from '@/constants/categories';

type TxType = 'expense' | 'income' | 'savings';

const TYPE_CONFIG = {
  expense: { label: 'Expense', icon: 'arrow-down-circle' as const, color: '#FF6B6B', gradients: ['#FF8C69', '#FF6B6B'] as [string, string] },
  income: { label: 'Income', icon: 'arrow-up-circle' as const, color: '#4ECDC4', gradients: ['#7EDDD6', '#4ECDC4'] as [string, string] },
  savings: { label: 'Savings', icon: 'save' as const, color: '#45B7D1', gradients: ['#6DD5ED', '#45B7D1'] as [string, string] },
};

const NUMPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

function formatDisplay(val: string): string {
  if (!val || val === '0') return '0';
  return val;
}

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { addTransaction, profile } = useApp();
  const params = useLocalSearchParams<{ editId?: string }>();

  const [txType, setTxType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('0');
  const [categoryId, setCategoryId] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@penny_selected_category').then(val => {
        if (val) {
          setCategoryId(val);
          AsyncStorage.removeItem('@penny_selected_category');
        }
      });
    }, [])
  );

  const sym = profile.currency.symbol;
  const config = TYPE_CONFIG[txType];
  const category = getCategoryById(categoryId);

  const handleNumpad = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }
    if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
      return;
    }
    if (amount === '0') {
      setAmount(key);
    } else {
      if (amount.includes('.')) {
        const parts = amount.split('.');
        if (parts[1].length >= 2) return;
      }
      if (amount.replace('.', '').length >= 8) return;
      setAmount(prev => prev + key);
    }
  }, [amount]);

  const handleTypeChange = (t: TxType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTxType(t);
    // Reset to default category for type
    if (t === 'expense') setCategoryId('food');
    else if (t === 'income') setCategoryId('salary');
    else setCategoryId('other_savings');
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);
    await addTransaction({
      type: txType,
      amount: amt,
      categoryId,
      note,
      date: new Date(date + 'T' + new Date().toTimeString().slice(0, 8)).toISOString(),
    });
    router.dismiss();
    setIsSubmitting(false);
  };

  const openCategoryPicker = () => {
    router.push({ pathname: '/category-picker', params: { type: txType, selected: categoryId } });
  };

  const bottomPad = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 8);

  return (
    <GradientBackground style={[styles.container, { paddingTop: insets.top }]}>
      {/* Drag handle */}
      <View style={styles.handle}>
        <View style={[styles.handleBar, { backgroundColor: theme.textTertiary }]} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Type Selector */}
        <View style={[styles.typeSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(Object.entries(TYPE_CONFIG) as [TxType, typeof TYPE_CONFIG.expense][]).map(([type, cfg]) => (
            <Pressable
              key={type}
              onPress={() => handleTypeChange(type)}
              style={[styles.typeBtn, txType === type && { backgroundColor: cfg.color + '20' }]}
            >
              <Ionicons name={cfg.icon} size={16} color={txType === type ? cfg.color : theme.textSecondary} />
              <Text style={[styles.typeBtnText, { color: txType === type ? cfg.color : theme.textSecondary }]}>
                {cfg.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={[styles.amountSymbol, { color: theme.textTertiary }]}>{sym}</Text>
          <Text style={[styles.amountValue, { color: config.color }]}>
            {formatDisplay(amount)}
          </Text>
        </View>

        {/* Category & Date */}
        <View style={styles.fieldsRow}>
          <Pressable onPress={openCategoryPicker} style={[styles.fieldBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <CategoryIcon categoryId={categoryId} size="sm" />
            <View style={styles.fieldBtnContent}>
              <Text style={[styles.fieldBtnLabel, { color: theme.textTertiary }]}>Category</Text>
              <Text style={[styles.fieldBtnValue, { color: theme.textPrimary }]} numberOfLines={1}>
                {category?.name ?? 'Select'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.fieldBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.dateIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            </View>
            <View style={styles.fieldBtnContent}>
              <Text style={[styles.fieldBtnLabel, { color: theme.textTertiary }]}>Date</Text>
              <TextInput
                style={[styles.dateInput, { color: theme.textPrimary }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.noteWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="create-outline" size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.noteInput, { color: theme.textPrimary }]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={theme.textTertiary}
            maxLength={100}
          />
          {note.length > 0 && (
            <Text style={[styles.noteCount, { color: theme.textTertiary }]}>{note.length}/100</Text>
          )}
        </View>

        {/* Numpad */}
        <View style={styles.numpad}>
          {NUMPAD.map((row, rIdx) => (
            <View key={rIdx} style={styles.numpadRow}>
              {row.map(key => (
                <Pressable
                  key={key}
                  onPress={() => handleNumpad(key)}
                  style={({ pressed }) => [
                    styles.numpadKey,
                    {
                      backgroundColor: key === '⌫'
                        ? (pressed ? theme.primary + '20' : theme.surface)
                        : pressed ? theme.primary + '15' : theme.surface,
                      borderColor: theme.border,
                    }
                  ]}
                >
                  {key === '⌫'
                    ? <Ionicons name="backspace-outline" size={22} color={theme.primary} />
                    : <Text style={[styles.numpadKeyText, { color: theme.textPrimary }]}>{key}</Text>
                  }
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: bottomPad + 16 }} />
      </ScrollView>

      {/* Submit */}
      <View style={[styles.submitWrapper, { paddingBottom: bottomPad + 8 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || parseFloat(amount) <= 0}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: parseFloat(amount) <= 0 ? 0.5 : 1,
          })}
        >
          <LinearGradient
            colors={config.gradients}
            style={styles.submitBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Adding...' : `Add ${config.label}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    gap: 2,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 16,
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 4,
  },
  amountSymbol: {
    fontSize: 28,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  amountValue: {
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  fieldsRow: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  fieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldBtnContent: { flex: 1 },
  fieldBtnLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  fieldBtnValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  dateInput: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  noteWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  noteCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  numpad: {
    paddingHorizontal: 20,
    gap: 8,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  numpadKey: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  numpadKeyText: {
    fontSize: 22,
    fontFamily: 'Inter_500Medium',
  },
  submitWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 32,
    ...(makeShadow('#FF6B6B', 4, 12, 0.3, 6) as object),
  },
  submitBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
