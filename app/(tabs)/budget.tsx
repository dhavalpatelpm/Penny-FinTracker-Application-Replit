import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, useApp } from '@/context/AppContext';
import GlassCard from '@/components/GlassCard';
import GradientBackground from '@/components/GradientBackground';
import CategoryIcon from '@/components/CategoryIcon';
import { getCategoryById } from '@/constants/categories';
import { makeShadow } from '@/utils/shadows';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { profile, getTransactionsByPeriod } = useApp();
  const sym = profile.currency.symbol;
  const now = new Date();

  const monthTxs = getTransactionsByPeriod(now.getFullYear(), now.getMonth());
  const totalExpenses = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const budgetUsedPct = profile.monthlyBudget > 0
    ? Math.min((totalExpenses / profile.monthlyBudget) * 100, 100)
    : 0;

  const budgetRemaining = profile.monthlyBudget - totalExpenses;

  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([id, spent]) => {
        const cat = getCategoryById(id);
        const budgeted = profile.categoryBudgets[id] || 0;
        const pct = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;
        return { id, name: cat?.name ?? id, color: cat?.color ?? '#9CA3AF', spent, budgeted, pct };
      });
  }, [monthTxs, profile.categoryBudgets]);

  const statusColor = budgetUsedPct > 90 ? theme.primary : budgetUsedPct > 70 ? theme.warning : theme.success;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <GradientBackground style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8 }]}
      >
        <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Budget</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>{monthLabel}</Text>

        {/* Main Budget Card */}
        {profile.monthlyBudget > 0 ? (
          <View style={styles.budgetCardWrapper}>
            <LinearGradient
              colors={budgetUsedPct > 90 ? ['#FF6B6B', '#E85555'] : budgetUsedPct > 70 ? ['#FFA726', '#FF8C00'] : ['#4ECDC4', '#26A69A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetCard}
            >
              <View style={styles.budgetCardDecoCircle} />
              <Text style={styles.budgetCardLabel}>Monthly Budget</Text>
              <Text style={styles.budgetCardTotal}>
                {sym}{profile.monthlyBudget.toLocaleString()}
              </Text>

              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <View style={[styles.progressFill, { width: `${budgetUsedPct}%`, backgroundColor: '#fff' }]} />
              </View>

              <View style={styles.budgetRow}>
                <View>
                  <Text style={styles.budgetSubLabel}>Spent</Text>
                  <Text style={styles.budgetSubValue}>{sym}{totalExpenses.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.budgetSubLabel}>Remaining</Text>
                  <Text style={styles.budgetSubValue}>
                    {budgetRemaining >= 0 ? `${sym}${budgetRemaining.toLocaleString()}` : `-${sym}${Math.abs(budgetRemaining).toLocaleString()}`}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <GlassCard style={styles.noBudgetCard}>
            <View style={styles.noBudgetContent}>
              <View style={[styles.noBudgetIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="wallet-outline" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.noBudgetTitle, { color: theme.textPrimary }]}>No budget set</Text>
              <Text style={[styles.noBudgetSub, { color: theme.textSecondary }]}>
                Set a monthly budget to track your spending
              </Text>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/edit-profile'); }}
                style={({ pressed }) => [styles.setBudgetBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
                testID="set-budget-btn"
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.setBudgetBtnText}>Set Budget</Text>
              </Pressable>
            </View>
          </GlassCard>
        )}

        {/* Spending by Category */}
        {categorySpend.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>By Category</Text>
            <GlassCard style={styles.catCard} padding={16}>
              {categorySpend.map((cat, idx) => (
                <View key={cat.id}>
                  {idx > 0 && <View style={[styles.sep, { backgroundColor: theme.separator }]} />}
                  <View style={styles.catRow}>
                    <CategoryIcon categoryId={cat.id} size="sm" />
                    <View style={styles.catMid}>
                      <View style={styles.catTop}>
                        <Text style={[styles.catName, { color: theme.textPrimary }]}>{cat.name}</Text>
                        <View style={styles.catAmounts}>
                          <Text style={[styles.catSpent, { color: theme.primary }]}>
                            {sym}{cat.spent.toLocaleString()}
                          </Text>
                          {cat.budgeted > 0 && (
                            <Text style={[styles.catBudgeted, { color: theme.textTertiary }]}>
                              /{sym}{cat.budgeted.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                      {cat.budgeted > 0 ? (
                        <>
                          <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                            <View style={[
                              styles.barFill,
                              {
                                backgroundColor: cat.pct > 90 ? theme.primary : cat.pct > 70 ? theme.warning : theme.success,
                                width: `${cat.pct}%`
                              }
                            ]} />
                          </View>
                          <Text style={[styles.catPct, { color: theme.textTertiary }]}>
                            {cat.pct.toFixed(0)}% used
                          </Text>
                        </>
                      ) : (
                        <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                          <View style={[styles.barFill, { backgroundColor: cat.color, width: '100%' }]} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {categorySpend.length === 0 && (
          <GlassCard style={styles.emptyCatCard}>
            <View style={styles.emptyCatContent}>
              <Ionicons name="pie-chart-outline" size={40} color={theme.textTertiary} />
              <Text style={[styles.emptyCatText, { color: theme.textSecondary }]}>
                No spending this month yet
              </Text>
            </View>
          </GlassCard>
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
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  budgetCardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    ...(makeShadow('#4ECDC4', 8, 20, 0.25, 10) as object),
  },
  budgetCard: {
    padding: 24,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  budgetCardDecoCircle: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  budgetCardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  budgetCardTotal: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSubLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  budgetSubValue: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  noBudgetCard: { marginBottom: 24 },
  noBudgetContent: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  noBudgetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBudgetTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  noBudgetSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  setBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 4,
  },
  setBudgetBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  catCard: {},
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  catMid: { flex: 1, gap: 6 },
  catTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  catAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  catSpent: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  catBudgeted: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
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
  sep: { height: 1 },
  emptyCatCard: { marginTop: 8 },
  emptyCatContent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyCatText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
