import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '@/constants/categories';

interface CategoryIconProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { box: 36, icon: 18, radius: 10 },
  md: { box: 48, icon: 22, radius: 14 },
  lg: { box: 56, icon: 26, radius: 16 },
};

export default function CategoryIcon({ categoryId, size = 'md' }: CategoryIconProps) {
  const category = getCategoryById(categoryId);
  const dims = SIZES[size];

  if (!category) {
    return (
      <View style={[styles.box, { width: dims.box, height: dims.box, borderRadius: dims.radius, backgroundColor: '#F3F4F6' }]}>
        <Ionicons name="ellipsis-horizontal-circle" size={dims.icon} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <View style={[styles.box, { width: dims.box, height: dims.box, borderRadius: dims.radius, backgroundColor: category.bgColor }]}>
      <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={dims.icon} color={category.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
