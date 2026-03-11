import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import AddGenreModal from '../../genres/components/AddGenreModal';
import { colors, radius, spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageGenres'>;

export default function ManageGenresScreen({ navigation }: Props) {
  const {
    genreOptions,
    addGenreOption,
    deleteGenreOption,
    isGenreOptionInUse,
  } = usePerformances();

  const [showAddGenreModal, setShowAddGenreModal] = useState(false);

  async function handleRemoveGenre(id: string) {
    if (isGenreOptionInUse(id)) {
      Alert.alert(
        'Cannot remove genre',
        'This genre is used by existing performances.'
      );
      return;
    }

    try {
      await deleteGenreOption(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Unable to remove genre', message);
    }
  }

  return (
    <ScreenContainer
      showHeader
      title="Genres"
      subtitle="Manage genres and navigate to sub-genres"
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
          genreOptions.map((genre) => (
            <Pressable
              key={genre.id}
              onPress={() =>
                navigation.navigate('ManageSubGenres', {
                  genreId: genre.id,
                  genreName: genre.name,
                })
              }
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.textContainer}>
                <Text style={styles.title}>{genre.name}</Text>
                <Text style={styles.subtitle}>Tap to manage sub-genres</Text>
                {isGenreOptionInUse(genre.id) ? (
                  <Text style={styles.disabledText}>
                    Used by existing performances
                  </Text>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    void handleRemoveGenre(genre.id);
                  }}
                  disabled={isGenreOptionInUse(genre.id)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    isGenreOptionInUse(genre.id) && styles.deleteButtonDisabled,
                    pressed &&
                      !isGenreOptionInUse(genre.id) &&
                      styles.deleteButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.deleteButtonText,
                      isGenreOptionInUse(genre.id) &&
                        styles.deleteButtonTextDisabled,
                    ]}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))
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
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  rowPressed: {
    opacity: 0.85,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  disabledText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  actions: {
    justifyContent: 'center',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButtonTextDisabled: {
    color: colors.textMuted,
  },
});