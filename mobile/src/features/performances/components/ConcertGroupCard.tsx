import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../../../components/AppCard';
import { ConcertGroup } from '../types/performance';
import { spacing } from '../../../theme/tokens';
import { cardStyles } from '../../../theme/cardStyles';
import { getBillingPriority } from '../utils/billingPriority';
import { colors } from '../../../theme/tokens';

type ConcertGroupCardProps = {
  group: ConcertGroup;
  onPress: () => void;
};

export default function ConcertGroupCard({
  group,
  onPress,
}: ConcertGroupCardProps) {
  const sortedPerformances = [...group.performances].sort((a, b) => {
    const billingDiff = getBillingPriority(a.billing) - getBillingPriority(b.billing);
    if (billingDiff !== 0) return billingDiff;

    return a.artist.localeCompare(b.artist);
  });

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
            {sortedPerformances.map((p, index) => {
              const isHeadliner = p.billing?.toLowerCase().trim() === 'headliner';

              return (
                <Text key={p.id}>
                  <Text style={isHeadliner && styles.headliner}>
                    {p.artist}
                  </Text>

                  {index < sortedPerformances.length - 1 ? ', ' : ''}
                </Text>
              );
            })}
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
  headliner: {
    fontWeight: '700',
    color: colors.accent,
  },
});