import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export type SortOption<T extends string> = {
  label: string;
  value: T;
};

type SortPillsProps<T extends string> = {
  options: SortOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
};

export default function SortPills<T extends string>({
  options,
  selectedValue,
  onChange,
}: SortPillsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option.value === selectedValue;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  pillActive: {
    backgroundColor: colors.accent,
  },
  pillText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#000000',
  },
});