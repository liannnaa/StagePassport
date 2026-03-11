import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import PerformanceCard from '../components/PerformanceCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupedPerformances'>;

export default function GroupedPerformancesScreen({
  route,
  navigation,
}: Props) {
  const { performances } = usePerformances();
  const params = route.params;

  const groupedPerformances = useMemo(() => {
    if (params.mode === 'concert') {
      return performances.filter(
        (performance) => performance.showId === params.showId
      );
    }

    return performances.filter(
      (performance) => performance.artist === params.artistName
    );
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