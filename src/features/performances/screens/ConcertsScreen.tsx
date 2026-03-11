import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import SearchBar from '../../../components/SearchBar';
import SortPills, { SortOption } from '../../../components/SortPills';
import EmptyState from '../../../components/EmptyState';
import ConcertGroupCard from '../components/ConcertGroupCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { ConcertGroupSortMode } from '../utils/groupSort';

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
  } = usePerformances();

  const navigation = useNavigation<NavigationProp>();

  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        title="Concerts"
        subtitle="Grouped by show"
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
      title="Concerts"
      subtitle="Grouped by show"
    >
      <SearchBar
        value={concertSearchQuery}
        onChangeText={setConcertSearchQuery}
        placeholder="Search show, venue, city, artist..."
      />

      <SortPills
        options={SORT_OPTIONS}
        selectedValue={concertSortMode}
        onChange={setConcertSortMode}
      />

      {filteredConcertGroups.length === 0 ? (
        <EmptyState
          title="No matching concerts"
          body="Try a different search or add performances first."
        />
      ) : (
        <AppScrollView contentContainerStyle={styles.listContent}>
          {filteredConcertGroups.map((item) => (
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