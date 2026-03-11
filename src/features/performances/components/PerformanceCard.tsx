import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../../../components/AppCard';
import { Performance } from '../types/performance';
import { spacing } from '../../../theme/tokens';
import { cardStyles } from '../../../theme/cardStyles';

type PerformanceCardProps = {
  performance: Performance;
  onPress: () => void;
};

export default function PerformanceCard({
  performance,
  onPress,
}: PerformanceCardProps) {
  const locationParts = [performance.venue, performance.city].filter(
    (value) => value.trim().length > 0
  );
  const locationText = locationParts.join(' • ');

  const genreText = [performance.genre, performance.subGenre].filter(
    (value) => value.trim().length > 0
  ).join(' • ');

  return (
    <AppCard onPress={onPress}>
      <View style={cardStyles.rowAlignedTop}>
        <View style={cardStyles.leftColumn}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {performance.artist}
          </Text>

          <Text style={cardStyles.emphasisText} numberOfLines={1}>
            {performance.showName}
          </Text>

          {locationText ? (
            <Text
              style={[cardStyles.secondaryText, styles.locationText]}
              numberOfLines={1}
            >
              {locationText}
            </Text>
          ) : null}

          {genreText ? (
            <Text style={cardStyles.smallMetaText} numberOfLines={1}>
              {genreText}
            </Text>
          ) : null}
        </View>

          <View style={[cardStyles.rightColumn, styles.rightColumn]}>
            <Text style={cardStyles.dateText}>{performance.date}</Text>

            {performance.tag ? (
              <View style={cardStyles.pillBadge}>
                <Text style={cardStyles.pillBadgeText}>{performance.tag}</Text>
              </View>
            ) : (
              <View style={styles.pillSpacer} />
            )}
          </View>
        </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  locationText: {
    marginBottom: spacing.sm,
  },
  rightColumn: {
    minWidth: 88,
    justifyContent: 'space-between',
  },
  pillSpacer: {
    height: 28,
  },
});