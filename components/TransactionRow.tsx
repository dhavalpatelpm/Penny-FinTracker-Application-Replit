import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { makeShadow } from '@/utils/shadows';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CategoryIcon from './CategoryIcon';
import { getCategoryById } from '@/constants/categories';
import { Transaction, useApp, useTheme } from '@/context/AppContext';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const theme = useTheme();
  const { profile, deleteTransaction } = useApp();
  const swipeRef = useRef<Swipeable>(null);
  const category = getCategoryById(transaction.categoryId);
  const symbol = profile.currency.symbol;

  const amountColor = transaction.type === 'expense'
    ? theme.primary
    : transaction.type === 'income'
    ? theme.success
    : theme.savings;

  const amountPrefix = transaction.type === 'expense' ? '-' : '+';

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.75, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.leftAction}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Ionicons name="pencil" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Edit</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.75, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.rightAction}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Delete</Text>
        </Animated.View>
      </View>
    );
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      swipeRef.current?.close();
      onEdit?.(transaction);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        'Delete Transaction',
        'Remove this transaction?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => swipeRef.current?.close(),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTransaction(transaction.id),
          },
        ],
      );
    }
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
      overshootLeft={false}
      overshootRight={false}
      containerStyle={styles.swipeContainer}
    >
      <View style={[styles.row, { backgroundColor: theme.isDark ? '#0D1E30' : '#fff' }]}>
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
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: 20,
    ...(Platform.OS !== 'web' ? makeShadow('#000000', 4, 12, 0.07, 4) as object : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
    }),
  },
  leftAction: {
    width: 88,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  rightAction: {
    width: 88,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: 20,
  },
  left: {
    width: 28,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  middle: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
