import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../theme/tokens';

type CatalogRowProps = {
  title: string;
  subtitle?: string;
  inUse?: boolean;
  usageLabel?: string;
  onViewUsage?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onPress?: () => void;
  onManageSubItems?: () => void;
  manageSubItemsLabel?: string;
};

export default function CatalogRow({
  title,
  subtitle,
  inUse = false,
  usageLabel,
  onViewUsage,
  onEdit,
  onDelete,
  onPress,
  onManageSubItems,
  manageSubItemsLabel = 'Manage',
}: CatalogRowProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {inUse ? (
          <Text style={styles.inUseText}>
            {usageLabel ?? 'Used by existing performances'}
          </Text>
        ) : null}
      </View>

      {onManageSubItems ? (
        <Pressable
          onPress={onManageSubItems}
          style={({ pressed }) => [
            styles.manageSubItemsButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.manageSubItemsButtonText}>
            {manageSubItemsLabel}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        {inUse && onViewUsage ? (
          <Pressable
            onPress={onViewUsage}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Uses</Text>
          </Pressable>
        ) : null}

        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressableWrapper,
          pressed && styles.rowPressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressableWrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  pressableWrapper: {
    marginBottom: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  textContainer: {
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
  inUseText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.surfaceMuted,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
  },
  manageSubItemsButton: {
    flexBasis: '100%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    width: '40%',
  },
  manageSubItemsButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});