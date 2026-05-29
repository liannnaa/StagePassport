import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../theme/tokens';

type CatalogSectionProps = {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onActionPress: () => void;
  children: React.ReactNode;
};

export default function CatalogSection({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  children,
}: CatalogSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <Pressable onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      </View>

      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});