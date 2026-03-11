import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

export default function AppScrollView(props: ScrollViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      {...props}
    />
  );
}