import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import SearchBar from '../../../components/SearchBar';
import SortPills, { SortOption } from '../../../components/SortPills';
import EmptyState from '../../../components/EmptyState';
import ArtistGroupCard from '../components/ArtistGroupCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { ArtistGroupSortMode } from '../utils/groupSort';

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
  } = usePerformances();

  const navigation = useNavigation<NavigationProp>();

  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        title="Artists"
        subtitle="Grouped by artist"
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      showHeader
      title="Artists"
      subtitle="Grouped by artist"
    >
      <SearchBar
        value={artistSearchQuery}
        onChangeText={setArtistSearchQuery}
        placeholder="Search artist..."
      />

      <SortPills
        options={SORT_OPTIONS}
        selectedValue={artistSortMode}
        onChange={setArtistSortMode}
      />

      {filteredArtistGroups.length === 0 ? (
        <EmptyState
          title="No matching artists"
          body="Try a different search or add performances first."
        />
      ) : (
        <AppScrollView contentContainerStyle={styles.listContent}>
          {filteredArtistGroups.map((item) => (
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});