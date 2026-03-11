import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import CatalogRow from '../components/CatalogRow';
import AddTagModal from '../../tags/components/AddTagModal';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageTags'>;

export default function ManageTagsScreen({ navigation }: Props) {
  const {
    tagOptions,
    addTagOption,
    deleteTagOption,
    isTagOptionInUse,
  } = usePerformances();

  const [showAddTagModal, setShowAddTagModal] = useState(false);

  async function handleRemoveTag(id: string) {
    if (isTagOptionInUse(id)) {
      Alert.alert(
        'Cannot remove tag',
        'This tag is used by existing performances.'
      );
      return;
    }

    try {
      await deleteTagOption(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Unable to remove tag', message);
    }
  }

  return (
    <ScreenContainer
      showHeader
      title="Tags"
      subtitle="Manage reusable tags"
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Add"
      onRightActionPress={() => setShowAddTagModal(true)}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        {tagOptions.length === 0 ? (
          <EmptyState
            title="No tags yet"
            body="Add a tag to build your catalog."
          />
        ) : (
          tagOptions.map((tag) => (
            <CatalogRow
              key={tag.id}
              title={tag.name}
              disabled={isTagOptionInUse(tag.id)}
              disabledReason={
                isTagOptionInUse(tag.id)
                  ? 'Used by existing performances'
                  : undefined
              }
              onDelete={() => {
                void handleRemoveTag(tag.id);
              }}
            />
          ))
        )}
      </AppScrollView>

      <AddTagModal
        visible={showAddTagModal}
        onClose={() => setShowAddTagModal(false)}
        onSave={async (tagName) => {
          try {
            await addTagOption(tagName);
            setShowAddTagModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add tag', message);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});