import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import CatalogRow from '../components/CatalogRow';
import AddSubGenreModal from '../../genres/components/AddSubGenreModal';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSubGenres'>;

export default function ManageSubGenresScreen({ route, navigation }: Props) {
  const { genreId, genreName } = route.params;

  const {
    getSubGenreOptionsByGenreId,
    addSubGenreOption,
    deleteSubGenreOption,
    isSubGenreOptionInUse,
  } = usePerformances();

  const [showAddSubGenreModal, setShowAddSubGenreModal] = useState(false);

  const subGenres = useMemo(
    () => getSubGenreOptionsByGenreId(genreId),
    [genreId, getSubGenreOptionsByGenreId]
  );

  async function handleRemoveSubGenre(id: string, name: string) {
    if (isSubGenreOptionInUse(id)) {
      Alert.alert(
        'Sub-genre is in use',
        'Open the usage list to replace or remove this sub-genre from performances first.'
      );
      return;
    }

    Alert.alert(
      'Remove sub-genre',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubGenreOption(id);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Something went wrong.';
              Alert.alert('Unable to remove sub-genre', message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title={genreName}
      subtitle={`${subGenres.length} ${
        subGenres.length === 1 ? 'sub-genre' : 'sub-genres'
      }`}
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Add"
      onRightActionPress={() => setShowAddSubGenreModal(true)}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        {subGenres.length === 0 ? (
          <EmptyState
            title="No sub-genres yet"
            body="Add a sub-genre for this genre."
          />
        ) : (
          subGenres.map((subGenre) => {
            const inUse = isSubGenreOptionInUse(subGenre.id);

            return (
              <CatalogRow
                key={subGenre.id}
                title={subGenre.name}
                inUse={inUse}
                usageLabel={
                  inUse ? 'Used by existing performances' : undefined
                }
                onViewUsage={() =>
                  navigation.navigate('CatalogUsage', {
                    type: 'subGenre',
                    id: subGenre.id,
                    label: subGenre.name,
                    genreId,
                    genreName,
                  })
                }
                onDelete={() => handleRemoveSubGenre(subGenre.id, subGenre.name)}
              />
            );
          })
        )}
      </AppScrollView>

      <AddSubGenreModal
        visible={showAddSubGenreModal}
        genreName={genreName}
        onClose={() => setShowAddSubGenreModal(false)}
        onSave={async (subGenreName) => {
          try {
            await addSubGenreOption(genreId, genreName, subGenreName);
            setShowAddSubGenreModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add sub-genre', message);
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