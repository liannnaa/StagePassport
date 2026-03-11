import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type AddSubGenreModalProps = {
  visible: boolean;
  genreName: string;
  initialSubGenreName?: string;
  onClose: () => void;
  onSave: (subGenreName: string) => void;
};

export default function AddSubGenreModal({
  visible,
  genreName,
  initialSubGenreName = '',
  onClose,
  onSave,
}: AddSubGenreModalProps) {
  const [subGenreName, setSubGenreName] = useState(initialSubGenreName);

  useEffect(() => {
    if (visible) {
      setSubGenreName(initialSubGenreName);
    }
  }, [visible, initialSubGenreName]);

  function handleClose() {
    setSubGenreName(initialSubGenreName);
    onClose();
  }

  function handleSave() {
    if (!subGenreName.trim()) return;
    onSave(subGenreName.trim());
    setSubGenreName(initialSubGenreName);
  }

  return (
    <TopSheetModal
      visible={visible}
      title={`Add Sub-Genre`}
      onClose={handleClose}
      onConfirm={handleSave}
      confirmLabel="Save"
    >
      <View style={styles.content}>
        <AppTextInput
          value={subGenreName}
          onChangeText={setSubGenreName}
          placeholder={`Sub-genre for ${genreName}`}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus
        />
      </View>
    </TopSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
});