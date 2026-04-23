import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import { colors, radius, spacing } from '../../../theme/tokens';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

export default function FormField({
  label,
  value,
  onChangeText,
}: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />
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
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
});