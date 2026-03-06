import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CategoryIcon from './CategoryIcon';
import { getCategoryById } from '@/constants/categories';
import { Transaction, useApp, useTheme } from '@/context/AppContext';

interface TransactionRowProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onPress?: (transaction: Transaction) => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function TransactionRow({ transaction, onDelete, onPress }: TransactionRowProps) {
  const theme = useTheme();
  const { profile } = useApp();
  const category = getCategoryById(transaction.categoryId);
  const symbol = profile.currency.symbol;

  const amountColor = transaction.type === 'expense'
    ? theme.primary
    : transaction.type === 'income'
    ? theme.success
    : theme.savings;

  const amountPrefix = transaction.type === 'expense' ? '-' : '+';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(transaction);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.(transaction.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.inputBackground : 'transparent',
          borderRadius: 16,
        },
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.time, { color: theme.textTertiary }]}>
          {formatTime(transaction.date)}
        </Text>
      </View>

      <CategoryIcon categoryId={transaction.categoryId} size="md" />

      <View style={styles.middle}>
        <Text style={[styles.categoryName, { color: theme.textPrimary }]} numberOfLines={1}>
          {category?.name ?? 'Other'}
        </Text>
        {transaction.note ? (
          <Text style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{symbol}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </Text>
        {onDelete ? (
          <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={14} color={theme.textTertiary} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  left: {
    width: 36,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  middle: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  note: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  deleteBtn: {
    padding: 2,
  },
});
