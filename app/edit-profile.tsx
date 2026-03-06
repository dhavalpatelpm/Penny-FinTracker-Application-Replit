import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTheme } from '@/context/AppContext';

const PROFESSIONS = [
  'Student', 'Employed', 'Self-employed', 'Freelancer',
  'Business Owner', 'Retired', 'Other',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { profile, updateProfile } = useApp();

  const [name, setName] = useState(profile.name);
  const [profession, setProfession] = useState(profile.profession);
  const [photoUri, setPhotoUri] = useState<string | undefined>(profile.photoUri);
  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCIES.find(c => c.code === profile.currency.code) || CURRENCIES[0]
  );
  const [budget, setBudget] = useState(
    profile.monthlyBudget > 0 ? profile.monthlyBudget.toString() : ''
  );
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCurrencies = useMemo(() =>
    CURRENCIES.filter(c =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.includes(currencySearch)
    ), [currencySearch]);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not available', 'Camera is not available on web.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePhotoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', ...(photoUri ? ['Remove Photo'] : [])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: photoUri ? 3 : undefined,
        },
        (index) => {
          if (index === 1) takePhoto();
          else if (index === 2) pickFromGallery();
          else if (index === 3 && photoUri) setPhotoUri(undefined);
        }
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromGallery },
        ...(photoUri ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => setPhotoUri(undefined) }] : []),
      ]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    await updateProfile({
      name: name.trim(),
      profession,
      currency: { code: selectedCurrency.code, symbol: selectedCurrency.symbol, name: selectedCurrency.name },
      monthlyBudget: parseFloat(budget) || 0,
      photoUri,
    });
    setIsSaving(false);
    router.back();
  };

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const initial = name ? name.charAt(0).toUpperCase() : 'P';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} testID="close-edit-profile">
          <Ionicons name="close" size={22} color={theme.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || isSaving}
          style={[styles.saveBtn, { opacity: name.trim() && !isSaving ? 1 : 0.4 }]}
          testID="save-profile"
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePhotoPress} style={styles.avatarWrapper} testID="edit-photo-btn">
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <LinearGradient
                colors={['#FF8C69', '#FF6B6B']}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarInitial}>{initial}</Text>
              </LinearGradient>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NAME</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: theme.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              maxLength={50}
              autoCapitalize="words"
              testID="name-input"
            />
            {name.length > 0 && <Ionicons name="checkmark-circle" size={18} color="#4ECDC4" />}
          </View>
        </View>

        {/* Profession */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PROFESSION</Text>
          <View style={styles.chipGrid}>
            {PROFESSIONS.map(p => (
              <Pressable
                key={p}
                onPress={() => { setProfession(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  profession === p && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, profession === p && { color: '#fff' }]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CURRENCY</Text>
          <Pressable
            onPress={() => { setShowCurrencyPicker(!showCurrencyPicker); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.currencySelector, { backgroundColor: theme.surface, borderColor: showCurrencyPicker ? theme.primary : theme.border }]}
            testID="currency-selector"
          >
            <View style={styles.currencyLeft}>
              <View style={[styles.currencyBadge, { backgroundColor: theme.primary + '18' }]}>
                <Text style={[styles.currencySymbol, { color: theme.primary }]}>{selectedCurrency.symbol}</Text>
              </View>
              <View>
                <Text style={[styles.currencyCode, { color: theme.textPrimary }]}>{selectedCurrency.code}</Text>
                <Text style={[styles.currencyName, { color: theme.textSecondary }]}>{selectedCurrency.name}</Text>
              </View>
            </View>
            <Ionicons
              name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          {showCurrencyPicker && (
            <View style={[styles.currencyDropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.searchRow, { borderBottomColor: theme.separator }]}>
                <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                  value={currencySearch}
                  onChangeText={setCurrencySearch}
                  placeholder="Search currencies..."
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                />
              </View>
              <ScrollView style={styles.currencyList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {filteredCurrencies.map(c => (
                  <Pressable
                    key={c.code}
                    onPress={() => {
                      setSelectedCurrency(c);
                      setShowCurrencyPicker(false);
                      setCurrencySearch('');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.currencyOption,
                      { borderBottomColor: theme.separator },
                      c.code === selectedCurrency.code && { backgroundColor: theme.primary + '12' },
                    ]}
                  >
                    <View style={[styles.currencyBadge, { backgroundColor: theme.primary + '18' }]}>
                      <Text style={[styles.currencySymbol, { color: theme.primary }]}>{c.symbol}</Text>
                    </View>
                    <Text style={[styles.currencyOptionCode, { color: theme.textPrimary }]}>{c.code}</Text>
                    <Text style={[styles.currencyOptionName, { color: theme.textSecondary }]}>{c.name}</Text>
                    {c.code === selectedCurrency.code && (
                      <Ionicons name="checkmark-circle" size={18} color={theme.primary} style={{ marginLeft: 'auto' }} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Monthly Budget */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>MONTHLY BUDGET</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.currencySymbol, { color: theme.primary }]}>{selectedCurrency.symbol}</Text>
            <TextInput
              style={[styles.textInput, { color: theme.textPrimary }]}
              value={budget}
              onChangeText={v => setBudget(v.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              testID="budget-input"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || isSaving}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], marginTop: 8 })}
          testID="save-profile-btn"
        >
          <LinearGradient
            colors={name.trim() ? ['#FF8C69', '#FF6B6B'] : ['#E5E7EB', '#D1D5DB']}
            style={styles.saveFullBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.saveFullBtnText, !name.trim() && { color: '#9CA3AF' }]}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF8F0',
  },
  avatarHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  currencyCode: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  currencyName: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  currencyDropdown: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    maxHeight: 260,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  currencyList: {
    maxHeight: 200,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  currencyOptionCode: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    width: 48,
  },
  currencyOptionName: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  saveFullBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 32,
  },
  saveFullBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
