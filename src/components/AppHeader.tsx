import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftActionLabel?: string;
  onLeftActionPress?: () => void;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

export default function AppHeader({
  title,
  subtitle,
  showBackButton,
  onBackPress,
  leftActionLabel,
  onLeftActionPress,
  rightActionLabel,
  onRightActionPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.side}>
          {showBackButton ? (
            <Pressable onPress={onBackPress} hitSlop={10} style={styles.actionButton}>
              <Text style={styles.backText}>ᐸ  Back</Text>
            </Pressable>
          ) : leftActionLabel ? (
            <Pressable onPress={onLeftActionPress}>
              <Text style={styles.actionText}>{leftActionLabel}</Text>
            </Pressable>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <View style={styles.center} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={[styles.side, styles.rightSide]}>
          {rightActionLabel ? (
            <Pressable onPress={onRightActionPress} hitSlop={10} style={styles.actionButton}>
              <Text style={styles.actionText}>{rightActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  topRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 72,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
});