import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import SearchBar from '../../../components/SearchBar';
import SortPills, { SortOption } from '../../../components/SortPills';
import EmptyState from '../../../components/EmptyState';
import PerformanceCard from '../components/PerformanceCard';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { SortMode } from '../utils/performanceSort';
import { openAddMenu } from '../utils/openAddMenu';
import ResultCount from '../components/ResultCount';

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceList'>;

const SORT_OPTIONS: SortOption<SortMode>[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Artist', value: 'artist' },
];

export default function PerformanceListScreen({ navigation }: Props) {
  
  const {
    filteredPerformances,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    performances,
  } = usePerformances();

  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        title="Performances"
        subtitle="Track every performance"
        leftActionLabel="Settings"
        onLeftActionPress={() => navigation.navigate('Settings')}
        rightActionLabel="Add"
        onRightActionPress={() => openAddMenu(navigation)}
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
      title="Performances"
      subtitle="Track every performance"
      leftActionLabel="Settings"
      onLeftActionPress={() => navigation.navigate('Settings')}
      rightActionLabel="Add"
      onRightActionPress={() => openAddMenu(navigation)}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search artist, show name, venue, city..."
      />

      <SortPills
        options={SORT_OPTIONS}
        selectedValue={sortMode}
        onChange={setSortMode}
      />

      <ResultCount
        count={filteredPerformances.length}
        total={performances.length}
        singular="performance"
        plural="performances"
      />

      {filteredPerformances.length === 0 ? (
        <EmptyState
          title="No matching performances"
          body="Try a different search or add a new performance."
        />
      ) : (
        <AppScrollView contentContainerStyle={styles.listContent}>
          {filteredPerformances.map((item) => (
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});