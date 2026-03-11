import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type PickerFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function PickerField({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
}: PickerFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => {
          if (disabled) return;
          onPress();
        }}
        activeOpacity={disabled ? 1 : 0.85}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.placeholderText,
            disabled && styles.triggerTextDisabled,
          ]}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  trigger: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  triggerDisabled: {
    opacity: 0.65,
  },
  triggerText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  triggerTextDisabled: {
    color: colors.textSecondary,
  },
  placeholderText: {
    color: colors.textMuted,
  },
});