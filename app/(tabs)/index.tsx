import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, useApp, Transaction } from '@/context/AppContext';
import TransactionRow from '@/components/TransactionRow';
import GlassCard from '@/components/GlassCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { profile, transactions, deleteTransaction, getTotalByType } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });

  const now = new Date();
  const income = getTotalByType('income', selectedPeriod.year, selectedPeriod.month);
  const expenses = getTotalByType('expense', selectedPeriod.year, selectedPeriod.month);
  const savings = getTotalByType('savings', selectedPeriod.year, selectedPeriod.month);
  const balance = income - expenses;
  const sym = profile.currency.symbol;

  const grouped = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: Record<string, Transaction[]> = {};
    sorted.forEach(tx => {
      const key = new Date(tx.date).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups).slice(0, 15);
  }, [transactions]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const monthLabel = new Date(selectedPeriod.year, selectedPeriod.month, 1)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/edit-profile'); }}
            style={[styles.avatar, { backgroundColor: theme.primary + '22', overflow: 'hidden' }]}
            testID="profile-avatar"
          >
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
              </Text>
            )}
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {profile.name || 'Welcome'}
            </Text>
          </View>
          <Pressable style={[styles.periodBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.periodLabel, { color: theme.textSecondary }]}>{monthLabel}</Text>
          </Pressable>
        </View>

        {/* Balance Hero Card */}
        <View style={styles.heroCardWrapper}>
          <LinearGradient
            colors={['#FF8C69', '#FF6B6B', '#E85555']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroDecoCircle1} />
            <View style={styles.heroDecoCircle2} />

            <Text style={styles.heroLabel}>Balance</Text>
            <Text style={styles.heroBalance}>
              {sym}{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              {balance < 0 ? ' overdrawn' : ''}
            </Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <View style={styles.heroStatIcon}>
                  <Ionicons name="arrow-up" size={12} color="#4ECDC4" />
                </View>
                <View>
                  <Text style={styles.heroStatLabel}>Income</Text>
                  <Text style={styles.heroStatValue}>{sym}{income.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name="arrow-down" size={12} color="#fff" />
                </View>
                <View>
                  <Text style={styles.heroStatLabel}>Expenses</Text>
                  <Text style={styles.heroStatValue}>{sym}{expenses.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(69,183,209,0.3)' }]}>
                  <Ionicons name="save" size={12} color="#45B7D1" />
                </View>
                <View>
                  <Text style={styles.heroStatLabel}>Savings</Text>
                  <Text style={styles.heroStatValue}>{sym}{savings.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Transactions</Text>
        </View>

        {grouped.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="receipt-outline" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No transactions yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap the + button to add your first one
              </Text>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.txCard} padding={16}>
            {grouped.map(([dateKey, txs], groupIdx) => {
              const dayTotal = txs.reduce((sum, t) => {
                if (t.type === 'income') return sum + t.amount;
                if (t.type === 'expense') return sum - t.amount;
                return sum;
              }, 0);
              return (
                <View key={dateKey}>
                  {groupIdx > 0 && <View style={[styles.groupDivider, { backgroundColor: theme.separator }]} />}
                  <View style={styles.dateHeader}>
                    <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
                      {formatDateHeader(txs[0].date)}
                    </Text>
                    <Text style={[styles.dateTotal, { color: dayTotal >= 0 ? theme.success : theme.primary }]}>
                      {dayTotal >= 0 ? '+' : ''}{sym}{Math.abs(dayTotal).toFixed(0)}
                    </Text>
                  </View>
                  {txs.map(tx => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      onDelete={handleDelete}
                    />
                  ))}
                </View>
              );
            })}
          </GlassCard>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  headerCenter: { flex: 1 },
  greeting: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  userName: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  heroCardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  heroBalance: {
    color: '#fff',
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  heroStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(78,205,196,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  txCard: { padding: 16 },
  groupDivider: {
    height: 1,
    marginVertical: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  dateTotal: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyCard: {},
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
