import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type AddVenueModalProps = {
  visible: boolean;
  initialVenueName?: string;
  onClose: () => void;
  onSave: (venueName: string, city: string) => void;
};

export default function AddVenueModal({
  visible,
  initialVenueName = '',
  onClose,
  onSave,
}: AddVenueModalProps) {
  const [venueName, setVenueName] = useState(initialVenueName);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (visible) {
      setVenueName(initialVenueName);
      setCity('');
    }
  }, [visible, initialVenueName]);

  function handleClose() {
    setVenueName(initialVenueName);
    setCity('');
    onClose();
  }

  function handleSave() {
    if (!venueName.trim() || !city.trim()) return;

    onSave(venueName.trim(), city.trim());
    setVenueName(initialVenueName);
    setCity('');
  }

  return (
    <TopSheetModal
      visible={visible}
      title="Add Venue"
      onClose={handleClose}
      onConfirm={handleSave}
      confirmLabel="Save"
    >
      <View style={styles.content}>
        <AppTextInput
          value={venueName}
          onChangeText={setVenueName}
          placeholder="Venue name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus
        />

        <AppTextInput
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
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