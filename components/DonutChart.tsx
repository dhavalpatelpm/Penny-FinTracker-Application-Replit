import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/context/AppContext';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  total: number;
  size?: number;
  strokeWidth?: number;
  currencySymbol?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({
  segments,
  total,
  size = 160,
  strokeWidth = 28,
  currencySymbol = '$',
}: DonutChartProps) {
  const theme = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  if (total === 0 || segments.length === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={theme.border} strokeWidth={strokeWidth} fill="none" />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>No data</Text>
        </View>
      </View>
    );
  }

  let currentAngle = 0;
  const paths: { path: string; color: string; key: string }[] = [];

  segments.forEach((seg, i) => {
    if (seg.value <= 0) return;
    const angle = (seg.value / total) * 360;
    const endAngle = currentAngle + angle;
    const path = arcPath(cx, cy, r, currentAngle, Math.min(endAngle, currentAngle + 359.99));
    paths.push({ path, color: seg.color, key: seg.label + i });
    currentAngle = endAngle;
  });

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size}>
        {paths.map(({ path, color, key }) => (
          <Path
            key={key}
            d={path}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
          {currencySymbol}{total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)}
        </Text>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
