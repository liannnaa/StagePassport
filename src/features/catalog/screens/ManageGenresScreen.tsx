import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import AddGenreModal from '../../genres/components/AddGenreModal';
import CatalogRow from '../components/CatalogRow';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageGenres'>;

export default function ManageGenresScreen({ navigation }: Props) {
  const {
    genreOptions,
    addGenreOption,
    deleteGenreOption,
    isGenreOptionInUse,
  } = usePerformances();

  const [showAddGenreModal, setShowAddGenreModal] = useState(false);

  async function handleRemoveGenre(id: string, name: string) {
    if (isGenreOptionInUse(id)) {
      Alert.alert(
        'Genre is in use',
        'Open the usage list to replace or remove this genre from performances first.'
      );
      return;
    }

    Alert.alert(
      'Remove genre',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGenreOption(id);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Something went wrong.';
              Alert.alert('Unable to remove genre', message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title="Genres"
      subtitle={`${genreOptions.length} ${
        genreOptions.length === 1 ? 'genre' : 'genres'
      }`}
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Add"
      onRightActionPress={() => setShowAddGenreModal(true)}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        {genreOptions.length === 0 ? (
          <EmptyState
            title="No genres yet"
            body="Add a genre to build your catalog."
          />
        ) : (
          genreOptions.map((genre) => {
            const inUse = isGenreOptionInUse(genre.id);

            return (
              <CatalogRow
                key={genre.id}
                title={genre.name}
                subtitle="Manage genre usage and sub-genres"
                inUse={inUse}
                usageLabel={inUse ? 'Used by existing performances' : undefined}
                onManageSubItems={() =>
                  navigation.navigate('ManageSubGenres', {
                    genreId: genre.id,
                    genreName: genre.name,
                  })
                }
                manageSubItemsLabel="Sub-genres"
                onViewUsage={() =>
                  navigation.navigate('CatalogUsage', {
                    type: 'genre',
                    id: genre.id,
                    label: genre.name,
                  })
                }
                onDelete={() => handleRemoveGenre(genre.id, genre.name)}
              />
            );
          })
        )}
      </AppScrollView>

      <AddGenreModal
        visible={showAddGenreModal}
        onClose={() => setShowAddGenreModal(false)}
        onSave={async (genreName) => {
          try {
            await addGenreOption(genreName);
            setShowAddGenreModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add genre', message);
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