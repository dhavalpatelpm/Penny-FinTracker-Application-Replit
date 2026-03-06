import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CategoryIcon from './CategoryIcon';
import { getCategoryById } from '@/constants/categories';
import { Transaction, useApp, useTheme } from '@/context/AppContext';

const SWIPE_THRESHOLD = 72;
const MAX_SWIPE = 100;

interface TransactionRowProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function TransactionRow({ transaction, onDelete, onEdit }: TransactionRowProps) {
  const theme = useTheme();
  const { profile } = useApp();
  const category = getCategoryById(transaction.categoryId);
  const symbol = profile.currency.symbol;

  const translateX = useRef(new Animated.Value(0)).current;
  const actionFired = useRef(false);

  const amountColor = transaction.type === 'expense'
    ? theme.primary
    : transaction.type === 'income'
    ? theme.success
    : theme.savings;

  const amountPrefix = transaction.type === 'expense' ? '-' : '+';

  const springBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        actionFired.current = false;
        translateX.setOffset((translateX as any).__getValue());
        translateX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        const clamped = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, g.dx));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        translateX.flattenOffset();
        const val = (translateX as any).__getValue();

        if (val > SWIPE_THRESHOLD && !actionFired.current) {
          actionFired.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start(() => {
            onEdit?.(transaction);
          });
        } else if (val < -SWIPE_THRESHOLD && !actionFired.current) {
          actionFired.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.timing(translateX, {
            toValue: -MAX_SWIPE,
            duration: 80,
            useNativeDriver: true,
          }).start(() => {
            springBack();
            onDelete?.(transaction.id);
          });
        } else {
          springBack();
        }
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        springBack();
      },
    })
  ).current;

  const editOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const deleteOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.actionBg, styles.editBg, { opacity: editOpacity }]}>
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </Animated.View>

      <Animated.View style={[styles.actionBg, styles.deleteBg, { opacity: deleteOpacity }]}>
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </Animated.View>

      <Animated.View
        style={[styles.rowContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.row, { backgroundColor: 'transparent' }]}>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    marginVertical: 1,
  },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  editBg: {
    backgroundColor: '#4ECDC4',
    justifyContent: 'flex-start',
  },
  deleteBg: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'flex-end',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  rowContainer: {
    backgroundColor: 'transparent',
  },
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
  },
  amount: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
