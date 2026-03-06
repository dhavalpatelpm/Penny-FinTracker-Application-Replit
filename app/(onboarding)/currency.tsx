import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { makeShadow } from '@/utils/shadows';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'IN' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: 'AE' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: 'CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: 'AU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: 'CH' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: 'SG' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'CN' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: 'BR' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: 'MX' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: 'KR' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: 'TH' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: 'ID' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: 'MY' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: 'PH' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: 'VN' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: 'TR' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: 'SA' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: 'ZA' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: 'NO' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: 'SE' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: 'DK' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: 'NZ' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: 'HK' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: 'PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: 'CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: 'HU' },
];

export default function CurrencyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name: string; profession: string }>();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(CURRENCIES[0]);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() =>
    CURRENCIES.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
    ), [search]);

  const handleSelect = (c: typeof CURRENCIES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(c);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(onboarding)/goal',
      params: { name: params.name, profession: params.profession, currencyCode: selected.code, currencySymbol: selected.symbol, currencyName: selected.name },
    });
  };

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.progressRow}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.progressDot, i === 2 && styles.progressDotActive, i < 2 && styles.progressDotDone]} />
          ))}
        </View>
        <Text style={styles.step}>STEP 2 OF 3</Text>
        <Text style={styles.title}>Your currency</Text>

        {/* Selected badge */}
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedSymbol}>{selected.symbol}</Text>
          <View>
            <Text style={styles.selectedCode}>{selected.code}</Text>
            <Text style={styles.selectedName}>{selected.name}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search currency..."
            placeholderTextColor="#C4C4C4"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.code}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isSelected = selected.code === item.code;
          return (
            <Pressable onPress={() => handleSelect(item)} style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}>
              <Text style={styles.currencySymbol}>{item.symbol}</Text>
              <View style={styles.currencyInfo}>
                <Text style={[styles.currencyCode, isSelected && { color: '#FF6B6B' }]}>{item.code}</Text>
                <Text style={styles.currencyName}>{item.name}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FF6B6B" />}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <Pressable onPress={handleNext} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <LinearGradient colors={['#FF8C69', '#FF6B6B']} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  progressDot: { height: 4, flex: 1, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: '#FF6B6B' },
  progressDotDone: { backgroundColor: '#4ECDC4' },
  step: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#FF6B6B', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#1A1A2E', marginBottom: 16 },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    ...(makeShadow('#FF6B6B', 4, 12, 0.15, 4) as object),
  },
  selectedSymbol: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#FF6B6B', width: 40, textAlign: 'center' },
  selectedCode: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#1A1A2E' },
  selectedName: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1A1A2E' },
  list: { flex: 1, paddingHorizontal: 24 },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
    borderRadius: 12,
  },
  currencyItemSelected: { backgroundColor: '#FFF0EE' },
  currencySymbol: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#374151', width: 36, textAlign: 'center' },
  currencyInfo: { flex: 1 },
  currencyCode: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#1A1A2E' },
  currencyName: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  separator: { height: 1, backgroundColor: '#F3F4F6' },
  footer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFF8F0', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 32,
    ...(makeShadow('#FF6B6B', 4, 12, 0.3, 6) as object),
  },
  nextBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
});
