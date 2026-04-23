// src/components/ResultCount.tsx

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../theme/tokens';

type Props = {
  count: number;
  total?: number;
  singular: string;
  plural: string;
};

export default function ResultCount({ count, total, singular, plural }: Props) {
  const label = count === 1 ? singular : plural;

  return (
    <Text style={styles.text}>
      {total !== undefined && count !== total
        ? `${count} of ${total} ${plural}`
        : `${count} ${label}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});