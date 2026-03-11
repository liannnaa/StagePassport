import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type AddTagModalProps = {
  visible: boolean;
  initialTagName?: string;
  onClose: () => void;
  onSave: (tagName: string) => void;
};

export default function AddTagModal({
  visible,
  initialTagName = '',
  onClose,
  onSave,
}: AddTagModalProps) {
  const [tagName, setTagName] = useState(initialTagName);

  useEffect(() => {
    if (visible) {
      setTagName(initialTagName);
    }
  }, [visible, initialTagName]);

  function handleClose() {
    setTagName(initialTagName);
    onClose();
  }

  function handleSave() {
    if (!tagName.trim()) return;
    onSave(tagName.trim());
    setTagName(initialTagName);
  }

  return (
    <TopSheetModal
      visible={visible}
      title="Add Tag"
      onClose={handleClose}
      onConfirm={handleSave}
      confirmLabel="Save"
    >
      <View style={styles.content}>
        <AppTextInput
          value={tagName}
          onChangeText={setTagName}
          placeholder="Tag name"
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