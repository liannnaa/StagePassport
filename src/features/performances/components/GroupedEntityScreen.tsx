import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import SearchBar from '../../../components/SearchBar';
import SortPills, { SortOption } from '../../../components/SortPills';
import EmptyState from '../../../components/EmptyState';
import ResultCount from './ResultCount';
import { colors } from '../../../theme/tokens';

type Props<TSort extends string, TItem> = {
  title: string;
  subtitle: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sortOptions: SortOption<TSort>[];
  selectedSort: TSort;
  onSortChange: (value: TSort) => void;
  isLoading: boolean;
  items: TItem[];
  emptyTitle: string;
  emptyBody: string;
  onSettingsPress: () => void;
  onAddPress: () => void;
  renderItem: (item: TItem) => React.ReactNode;
  filteredGroupsLength: number;
  groupsLength: number;
  singularName: string;
  pluralName: string;
};

export default function GroupedEntityScreen<TSort extends string, TItem>({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  sortOptions,
  selectedSort,
  onSortChange,
  isLoading,
  items,
  emptyTitle,
  emptyBody,
  onSettingsPress,
  onAddPress,
  renderItem,
  filteredGroupsLength,
  groupsLength,
  singularName,
  pluralName,
}: Props<TSort, TItem>) {
  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        title={title}
        subtitle={subtitle}
        leftActionLabel="Settings"
        onLeftActionPress={onSettingsPress}
        rightActionLabel="Add"
        onRightActionPress={onAddPress}
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
      title={title}
      subtitle={subtitle}
      leftActionLabel="Settings"
      onLeftActionPress={onSettingsPress}
      rightActionLabel="Add"
      onRightActionPress={onAddPress}
    >
      <SearchBar
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <SortPills
        options={sortOptions}
        selectedValue={selectedSort}
        onChange={onSortChange}
      />

      <ResultCount
        count={filteredGroupsLength}
        total={groupsLength}
        singular={singularName}
        plural={pluralName}
      />

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} />
      ) : (
        <AppScrollView contentContainerStyle={styles.listContent}>
          {items.map(renderItem)}
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