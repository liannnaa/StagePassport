import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchablePickerField, {
  PickerOption,
} from '../../catalog/components/SearchablePickerField';
import { colors, radius, spacing } from '../../../theme/tokens';

type Props = {
  tags: string[];
  options: PickerOption[];
  onAddTag: (tagName: string) => void;
  onRemoveTag: (tagName: string) => void;
  onClearTags: () => void;
  onAddNew: (searchText: string) => void;
};

export default function TagMultiSelectField({
  tags,
  options,
  onAddTag,
  onRemoveTag,
  onClearTags,
  onAddNew,
}: Props) {
  return (
    <>
      <SearchablePickerField
        label="Tags"
        selectedLabel={
          tags.length > 0
            ? `${tags.length} tag${tags.length === 1 ? '' : 's'} selected`
            : ''
        }
        placeholder="Choose or add multiple tags"
        options={options}
        onSelect={(option) => onAddTag(option.title)}
        onClear={onClearTags}
        onAddNew={onAddNew}
        addNewLabel="Add tag"
      />

      {tags.length > 0 ? (
        <View style={styles.tagChipContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagChip}
              onPress={() => onRemoveTag(tag)}
              activeOpacity={0.8}
            >
              <Text style={styles.tagChipText}>{tag}</Text>
              <Text style={styles.tagChipRemove}> ×</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.multiSelectHelperText}>
          You can select more than one tag.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tagChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagChipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  tagChipRemove: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  multiSelectHelperText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});