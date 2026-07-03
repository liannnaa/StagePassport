import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '../../../components/AppTextInput';
import TopSheetModal from '../../../components/TopSheetModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type AddBillingModalProps = {
  visible: boolean;
  initialBillingName?: string;
  onClose: () => void;
  onSave: (billingName: string) => void;
};

export default function AddBillingModal({
  visible,
  initialBillingName = '',
  onClose,
  onSave,
}: AddBillingModalProps) {
  const [billingName, setBillingName] = useState(initialBillingName);

  useEffect(() => {
    if (visible) {
      setBillingName(initialBillingName);
    }
  }, [visible, initialBillingName]);

  function handleClose() {
    setBillingName(initialBillingName);
    onClose();
  }

  function handleSave() {
    if (!billingName.trim()) return;
    onSave(billingName.trim());
    setBillingName(initialBillingName);
  }

  return (
    <TopSheetModal
      visible={visible}
      title="Add Billing"
      onClose={handleClose}
      onConfirm={handleSave}
      confirmLabel="Save"
    >
      <View style={styles.content}>
        <AppTextInput
          value={billingName}
          onChangeText={setBillingName}
          placeholder="Billing name"
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