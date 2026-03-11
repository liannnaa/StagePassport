import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../theme/tokens';

type CatalogRowProps = {
  title: string;
  subtitle?: string;
  disabled?: boolean;
  disabledReason?: string;
  onDelete: () => void;
};

export default function CatalogRow({
  title,
  subtitle,
  disabled = false,
  disabledReason,
  onDelete,
}: CatalogRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {disabled && disabledReason ? (
          <Text style={styles.disabledText}>{disabledReason}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={onDelete}
        disabled={disabled}
        style={({ pressed }) => [
          styles.deleteButton,
          disabled && styles.deleteButtonDisabled,
          pressed && !disabled && styles.deleteButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.deleteButtonText,
            disabled && styles.deleteButtonTextDisabled,
          ]}
        >
          Remove
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  disabledText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButtonTextDisabled: {
    color: colors.textMuted,
  },
});