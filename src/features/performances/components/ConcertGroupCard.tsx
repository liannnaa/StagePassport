import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../../../components/AppCard';
import { ConcertGroup } from '../types/performance';
import { spacing } from '../../../theme/tokens';
import { cardStyles } from '../../../theme/cardStyles';

type ConcertGroupCardProps = {
  group: ConcertGroup;
  onPress: () => void;
};

export default function ConcertGroupCard({
  group,
  onPress,
}: ConcertGroupCardProps) {
  const artistNames = Array.from(
    new Set(group.performances.map((performance) => performance.artist))
  );

  const locationParts = [group.venue, group.city].filter(
    (value) => value.trim().length > 0
  );
  const locationText = locationParts.join(' • ');

  return (
    <AppCard onPress={onPress}>
      <View style={cardStyles.row}>
        <View style={cardStyles.leftColumn}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {group.showName}
          </Text>

          {locationText ? (
            <Text
              style={[cardStyles.secondaryText, styles.locationText]}
              numberOfLines={1}
            >
              {locationText}
            </Text>
          ) : null}

          <Text style={cardStyles.tertiaryText} numberOfLines={1}>
            {artistNames.join(', ')}
          </Text>
        </View>

        <View style={[cardStyles.rightColumn, styles.rightColumn]}>
          <Text style={cardStyles.dateText}>{group.date}</Text>

          <View style={cardStyles.statBadge}>
            <Text style={cardStyles.statNumber}>{group.performances.length}</Text>
            <Text style={cardStyles.statLabel}>act{group.performances.length === 1 ? '' : 's'}</Text>
          </View>
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
    minWidth: 72,
  },
});