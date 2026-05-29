import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GroupedEntityScreen from '../components/GroupedEntityScreen';
import ConcertGroupCard from '../components/ConcertGroupCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { ConcertGroupSortMode } from '../utils/groupSort';
import { openAddMenu } from '../utils/openAddMenu';
import { SortOption } from '../../../components/SortPills';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS: SortOption<ConcertGroupSortMode>[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Show', value: 'showName' },
];

export default function ConcertsScreen() {
  const {
    filteredConcertGroups,
    concertSearchQuery,
    setConcertSearchQuery,
    concertSortMode,
    setConcertSortMode,
    isLoading,
    concertGroups,
  } = usePerformances();

  const navigation = useNavigation<NavigationProp>();

  return (
    <GroupedEntityScreen
      title="Concerts"
      subtitle="Grouped by show"
      searchValue={concertSearchQuery}
      onSearchChange={setConcertSearchQuery}
      searchPlaceholder="Search show, venue, city, artist..."
      sortOptions={SORT_OPTIONS}
      selectedSort={concertSortMode}
      onSortChange={setConcertSortMode}
      isLoading={isLoading}
      items={filteredConcertGroups}
      emptyTitle="No matching concerts"
      emptyBody="Try a different search or add performances first."
      onSettingsPress={() => navigation.navigate('Settings')}
      onAddPress={() => openAddMenu(navigation)}
      renderItem={(item) => (
        <ConcertGroupCard
          key={item.showId}
          group={item}
          onPress={() =>
            navigation.navigate('GroupedPerformances', {
              mode: 'concert',
              showId: item.showId,
              title: item.showName,
            })
          }
        />
      )}
      filteredGroupsLength={filteredConcertGroups.length}
      groupsLength={concertGroups.length}
      singularName='concert'
      pluralName='concerts'
    />
  );
}