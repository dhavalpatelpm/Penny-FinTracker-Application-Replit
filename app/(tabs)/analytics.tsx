import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useApp } from '@/context/AppContext';
import GlassCard from '@/components/GlassCard';
import DonutChart from '@/components/DonutChart';
import GradientBackground from '@/components/GradientBackground';
import { getCategoryById } from '@/constants/categories';

const PERIODS = ['Week', 'Month', 'Year'] as const;
type Period = typeof PERIODS[number];

function getDateRange(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();
  if (period === 'Week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start, end: now, label: 'Last 7 days' };
  }
  if (period === 'Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now, label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  return { start, end: now, label: `${now.getFullYear()}` };
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { transactions, profile } = useApp();
  const sym = profile.currency.symbol;
  const [activePeriod, setActivePeriod] = useState<Period>('Month');
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');

  const { start, end, label } = getDateRange(activePeriod);

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end && t.type === activeType;
    }), [transactions, start, end, activeType]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([id, amount]) => {
        const cat = getCategoryById(id);
        return {
          id,
          label: cat?.name ?? id,
          value: amount,
          color: cat?.color ?? '#9CA3AF',
          bgColor: cat?.bgColor ?? '#F3F4F6',
          pct: total > 0 ? (amount / total) * 100 : 0,
        };
      });
  }, [filtered, total]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <GradientBackground style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8 }]}
      >
        <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Analytics</Text>

        {/* Period Selector */}
        <View style={[styles.pillRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {PERIODS.map(p => (
            <Pressable
              key={p}
              onPress={() => setActivePeriod(p)}
              style={[styles.pill, activePeriod === p && { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.pillText, { color: activePeriod === p ? '#fff' : theme.textSecondary }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Type Toggle */}
        <View style={[styles.typeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            onPress={() => setActiveType('expense')}
            style={[styles.typeBtn, activeType === 'expense' && { backgroundColor: theme.primary + '20' }]}
          >
            <Ionicons name="arrow-down-circle" size={16} color={activeType === 'expense' ? theme.primary : theme.textSecondary} />
            <Text style={[styles.typeBtnText, { color: activeType === 'expense' ? theme.primary : theme.textSecondary }]}>Expenses</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveType('income')}
            style={[styles.typeBtn, activeType === 'income' && { backgroundColor: theme.success + '20' }]}
          >
            <Ionicons name="arrow-up-circle" size={16} color={activeType === 'income' ? theme.success : theme.textSecondary} />
            <Text style={[styles.typeBtnText, { color: activeType === 'income' ? theme.success : theme.textSecondary }]}>Income</Text>
          </Pressable>
        </View>

        {/* Chart Card */}
        <GlassCard style={styles.chartCard}>
          <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>{label}</Text>
          <Text style={[styles.chartTotal, { color: theme.textPrimary }]}>
            {sym}{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>

          {byCategory.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="pie-chart-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data for this period</Text>
            </View>
          ) : (
            <View style={styles.chartRow}>
              <DonutChart
                segments={byCategory.slice(0, 6).map(c => ({ label: c.label, value: c.value, color: c.color }))}
                total={total}
                size={160}
                strokeWidth={30}
                currencySymbol={sym}
              />
              <View style={styles.legend}>
                {byCategory.slice(0, 5).map(c => (
                  <View key={c.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                    <Text style={[styles.legendLabel, { color: theme.textSecondary }]} numberOfLines={1}>{c.label}</Text>
                    <Text style={[styles.legendPct, { color: theme.textPrimary }]}>{c.pct.toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </GlassCard>

        {/* Category Breakdown */}
        {byCategory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Breakdown</Text>
            <GlassCard style={styles.breakdownCard} padding={16}>
              {byCategory.map((cat, idx) => (
                <View key={cat.id}>
                  {idx > 0 && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
                  <View style={styles.breakdownRow}>
                    <View style={[styles.catDot, { backgroundColor: cat.bgColor }]}>
                      <View style={[styles.catDotInner, { backgroundColor: cat.color }]} />
                    </View>
                    <View style={styles.breakdownMid}>
                      <View style={styles.breakdownTop}>
                        <Text style={[styles.catName, { color: theme.textPrimary }]}>{cat.label}</Text>
                        <Text style={[styles.catAmount, { color: activeType === 'expense' ? theme.primary : theme.success }]}>
                          {sym}{cat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                        <View style={[styles.barFill, { backgroundColor: cat.color, width: `${cat.pct}%` }]} />
                      </View>
                      <Text style={[styles.catPct, { color: theme.textTertiary }]}>{cat.pct.toFixed(1)}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  pillRow: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    marginBottom: 12,
    gap: 2,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  typeBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  chartCard: { marginBottom: 24 },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  chartTotal: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  legendPct: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  breakdownCard: {},
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  catDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  catDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  breakdownMid: { flex: 1, gap: 6 },
  breakdownTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  catAmount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  catPct: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  separator: {
    height: 1,
  },
});
