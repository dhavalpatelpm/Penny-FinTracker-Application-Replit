import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/AppContext';
import CategoryIcon from '@/components/CategoryIcon';
import { getCategoriesForType, type Category } from '@/constants/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_CATEGORY_KEY = '@penny_selected_category';

export default function CategoryPickerScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ type: string; selected: string }>();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(params.selected || '');

  const type = (params.type || 'expense') as 'expense' | 'income' | 'savings';
  const categories = getCategoriesForType(type);

  const filtered = useMemo(() =>
    categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ), [categories, search]);

  const handleSelect = async (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(cat.id);
    // Store selection then dismiss - add-transaction will read it
    await AsyncStorage.setItem(SELECTED_CATEGORY_KEY, cat.id);
    router.dismiss();
  };

  const bottomPad = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Drag handle */}
      <View style={styles.handle}>
        <View style={[styles.handleBar, { backgroundColor: theme.textTertiary }]} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Select Category</Text>
        <Pressable onPress={() => router.dismiss()} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={24} color={theme.textTertiary} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search categories..."
          placeholderTextColor={theme.textTertiary}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        numColumns={3}
        contentContainerStyle={[styles.grid, { paddingBottom: bottomPad + 16 }]}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [
                styles.catItem,
                {
                  backgroundColor: isSelected ? item.color + '15' : theme.surface,
                  borderColor: isSelected ? item.color : theme.border,
                  opacity: pressed ? 0.7 : 1,
                }
              ]}
            >
              <CategoryIcon categoryId={item.id} size="md" />
              <Text style={[styles.catName, { color: isSelected ? item.color : theme.textPrimary }]} numberOfLines={2}>
                {item.name}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  grid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  row: {
    gap: 10,
    justifyContent: 'flex-start',
  },
  catItem: {
    flex: 1,
    maxWidth: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
    position: 'relative',
  },
  catName: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 14,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
