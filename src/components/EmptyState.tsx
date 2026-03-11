import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type EmptyStateProps = {
  title: string;
  body: string;
};

export default function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});