import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../../../components/AppCard';
import { ArtistGroup } from '../types/performance';
import { colors, spacing } from '../../../theme/tokens';
import { cardStyles } from '../../../theme/cardStyles';

type ArtistGroupCardProps = {
  group: ArtistGroup;
  onPress: () => void;
};

export default function ArtistGroupCard({
  group,
  onPress,
}: ArtistGroupCardProps) {
  const genreText = [group.genre, group.subGenre].filter(
    (value) => (value ?? '').trim().length > 0
  ).join(' • ');

  return (
    <AppCard onPress={onPress}>
      <View style={[cardStyles.row, styles.row]}>
        <View style={cardStyles.leftColumn}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {group.artistName}
          </Text>

          {genreText ? (
            <Text style={[cardStyles.secondaryText, styles.genreText]} numberOfLines={1}>
              {genreText}
            </Text>
          ) : null}

          <Text style={cardStyles.smallMetaText}>
            Latest: {group.latestDate ?? '—'}
          </Text>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.bigNumber}>{group.performanceCount}</Text>
          <Text style={styles.bigLabel}>
            performance{group.performanceCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  genreText: {
    marginBottom: spacing.sm,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 90,
  },
  bigNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  bigLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
});