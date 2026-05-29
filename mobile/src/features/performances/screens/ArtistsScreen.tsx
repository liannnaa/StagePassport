import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GroupedEntityScreen from '../components/GroupedEntityScreen';
import ArtistGroupCard from '../components/ArtistGroupCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { ArtistGroupSortMode } from '../utils/groupSort';
import { openAddMenu } from '../utils/openAddMenu';
import { SortOption } from '../../../components/SortPills';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS: SortOption<ArtistGroupSortMode>[] = [
  { label: 'Artist', value: 'artist' },
  { label: 'Most Seen', value: 'mostPerformances' },
  { label: 'Latest', value: 'latest' },
];

export default function ArtistsScreen() {
  const {
    filteredArtistGroups,
    artistSearchQuery,
    setArtistSearchQuery,
    artistSortMode,
    setArtistSortMode,
    isLoading,
    artistGroups,
  } = usePerformances();

  const navigation = useNavigation<NavigationProp>();

  return (
    <GroupedEntityScreen
      title="Artists"
      subtitle="Grouped by artist"
      searchValue={artistSearchQuery}
      onSearchChange={setArtistSearchQuery}
      searchPlaceholder="Search artist..."
      sortOptions={SORT_OPTIONS}
      selectedSort={artistSortMode}
      onSortChange={setArtistSortMode}
      isLoading={isLoading}
      items={filteredArtistGroups}
      emptyTitle="No matching artists"
      emptyBody="Try a different search or add performances first."
      onSettingsPress={() => navigation.navigate('Settings')}
      onAddPress={() => openAddMenu(navigation)}
      renderItem={(item) => (
        <ArtistGroupCard
          key={item.artistName}
          group={item}
          onPress={() =>
            navigation.navigate('GroupedPerformances', {
              mode: 'artist',
              artistName: item.artistName,
              title: item.artistName,
            })
          }
        />
      )}
      filteredGroupsLength={filteredArtistGroups.length}
      groupsLength={artistGroups.length}
      singularName='artist'
      pluralName='artists'
    />
  );
}