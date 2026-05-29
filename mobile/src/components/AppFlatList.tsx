import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

export default function AppFlatList<ItemT>(props: FlatListProps<ItemT>) {
  return (
    <FlatList
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      {...props}
    />
  );
}