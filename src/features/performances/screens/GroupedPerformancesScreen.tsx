import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import PerformanceCard from '../components/PerformanceCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { getBillingPriority } from '../utils/billingPriority';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupedPerformances'>;

export default function GroupedPerformancesScreen({
  route,
  navigation,
}: Props) {
  const { performances } = usePerformances();
  const params = route.params;

  const groupedPerformances = useMemo(() => {
    const items =
      params.mode === 'concert'
        ? performances.filter((performance) => performance.showId === params.showId)
        : performances.filter((performance) => performance.artist === params.artistName);

    if (params.mode !== 'concert') return items;

    return [...items].sort((a, b) => {
      const billingDiff = getBillingPriority(a.billing) - getBillingPriority(b.billing);
      if (billingDiff !== 0) return billingDiff;

      return a.artist.localeCompare(b.artist);
    });
  }, [performances, params]);

  return (
    <ScreenContainer
      showHeader
      title={params.title}
      subtitle={`${groupedPerformances.length} performance${
        groupedPerformances.length === 1 ? '' : 's'
      }`}
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Edit"
      onRightActionPress={() => {
        if (params.mode === 'concert') {
          navigation.navigate('ConcertForm', {
            mode: 'edit',
            showId: params.showId,
          });
          return;
        }

        navigation.navigate('ArtistForm', {
          mode: 'edit',
          artistName: params.artistName,
        });
      }}
    >
      {groupedPerformances.length === 0 ? (
        <EmptyState
          title="No performances found"
          body="There are no matching performances for this view."
        />
      ) : (
        <AppScrollView contentContainerStyle={styles.listContent}>
          {groupedPerformances.map((item) => (
            <PerformanceCard
              key={item.id}
              performance={item}
              onPress={() =>
                navigation.navigate('PerformanceDetail', {
                  performanceId: item.id,
                })
              }
            />
          ))}
        </AppScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
});