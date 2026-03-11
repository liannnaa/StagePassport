import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from './tokens';

export const cardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowAlignedTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emphasisText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tertiaryText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  smallMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    minWidth: 58,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});