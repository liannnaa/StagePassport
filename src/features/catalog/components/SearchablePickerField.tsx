import React, { useMemo, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import AppFlatList from '../../../components/AppFlatList';
import PickerField from '../../../components/PickerField';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

export type PickerOption = {
  id: string;
  title: string;
  subtitle?: string;
};

type SearchablePickerFieldProps = {
  label: string;
  selectedLabel: string;
  placeholder: string;
  options: PickerOption[];
  onSelect: (option: PickerOption) => void;
  onAddNew?: (searchText: string) => void;
  onClear?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
};

export default function SearchablePickerField({
  label,
  selectedLabel,
  placeholder,
  options,
  onSelect,
  onAddNew,
  onClear,
  addNewLabel = 'Add new',
  disabled = false,
  searchPlaceholder = 'Search...',
}: SearchablePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return options;

    return options.filter(
      (option) =>
        option.title.toLowerCase().includes(normalized) ||
        (option.subtitle?.toLowerCase().includes(normalized) ?? false)
    );
  }, [options, query]);

  function openModal() {
    if (disabled) return;
    setVisible(true);
  }

  function closeModal() {
    Keyboard.dismiss();
    setVisible(false);
    setQuery('');
  }

  function handleSelect(option: PickerOption) {
    Keyboard.dismiss();
    onSelect(option);
    closeModal();
  }

  function handleClear() {
    Keyboard.dismiss();
    onClear?.();
    closeModal();
  }

  function handleAddNew() {
    const trimmedQuery = query.trim();
    Keyboard.dismiss();
    closeModal();

    requestAnimationFrame(() => {
      onAddNew?.(trimmedQuery);
    });
  }

  const canShowAddNew = Boolean(onAddNew);
  const canShowClear = Boolean(onClear && selectedLabel.trim());

  return (
    <>
      <PickerField
        label={label}
        value={selectedLabel}
        placeholder={placeholder}
        disabled={disabled}
        onPress={openModal}
      />

      <TopSheetModal
        visible={visible}
        title={label}
        onClose={closeModal}
        onConfirm={closeModal}
        confirmLabel="Done"
      >
        <View style={styles.content}>
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          {canShowClear ? (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear selection</Text>
            </TouchableOpacity>
          ) : null}

          <AppFlatList
            data={filteredOptions}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.optionTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                ) : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No matches found</Text>
              </View>
            }
          />
          {canShowAddNew ? (
            <View style={styles.fixedFooter}>
              <TouchableOpacity style={styles.addRow} onPress={handleAddNew}>
                <Text style={styles.addRowText}>
                  {addNewLabel}
                  {query.trim() ? `: "${query.trim()}"` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </TopSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  clearButton: {
    marginBottom: spacing.sm,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  list: {
    width: '100%',
    alignSelf: 'stretch',
    maxHeight: 360,
  },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: spacing.lg,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  fixedFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  addRow: {
    paddingVertical: 14,
  },
  addRowText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});