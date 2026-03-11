import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { dismissKeyboardAndRun } from '../utils/dismissKeyboardAndRun';

type TopSheetModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  children: React.ReactNode;
};

export default function TopSheetModal({
  visible,
  title,
  onClose,
  onConfirm,
  confirmLabel = 'Done',
  children,
}: TopSheetModalProps) {
  function handleClose() {
    dismissKeyboardAndRun(onClose);
  }

  function handleConfirm() {
    dismissKeyboardAndRun(onConfirm ?? onClose);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.sheetTitle}>{title}</Text>

            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>{children}</View>
        </View>

        <Pressable style={styles.backdrop} onPress={handleClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 3,
    paddingBottom: spacing.lg,
    maxHeight: '72%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backdrop: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    width: '100%',
    alignSelf: 'stretch',
  },
});