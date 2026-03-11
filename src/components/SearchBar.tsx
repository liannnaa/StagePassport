import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from './AppTextInput';
import { colors, radius, spacing } from '../theme/tokens';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        clearButtonMode="while-editing"
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
});