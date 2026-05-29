import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import AppFlatList from './AppFlatList';
import TopSheetModal from './TopSheetModal';
import { colors } from '../theme/tokens';

export type OptionSheetItem<T extends string> = {
  label: string;
  value: T;
};

type OptionSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: OptionSheetItem<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export default function OptionSheet<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  return (
    <TopSheetModal
      visible={visible}
      title={title}
      onClose={onClose}
      onConfirm={onClose}
      confirmLabel="Done"
    >
      <AppFlatList
        data={options}
        keyExtractor={(item) => item.value}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isSelected = item.value === selectedValue;

          return (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </TopSheetModal>
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
    width: '100%',
  },
  optionRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});