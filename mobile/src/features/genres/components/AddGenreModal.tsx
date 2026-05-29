import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type AddGenreModalProps = {
  visible: boolean;
  initialGenreName?: string;
  onClose: () => void;
  onSave: (genreName: string) => void;
};

export default function AddGenreModal({
  visible,
  initialGenreName = '',
  onClose,
  onSave,
}: AddGenreModalProps) {
  const [genreName, setGenreName] = useState(initialGenreName);

  useEffect(() => {
    if (visible) {
      setGenreName(initialGenreName);
    }
  }, [visible, initialGenreName]);

  function handleClose() {
    setGenreName(initialGenreName);
    onClose();
  }

  function handleSave() {
    if (!genreName.trim()) return;
    onSave(genreName.trim());
    setGenreName(initialGenreName);
  }

  return (
    <TopSheetModal
      visible={visible}
      title="Add Genre"
      onClose={handleClose}
      onConfirm={handleSave}
      confirmLabel="Save"
    >
      <View style={styles.content}>
        <AppTextInput
          value={genreName}
          onChangeText={setGenreName}
          placeholder="Genre name"
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