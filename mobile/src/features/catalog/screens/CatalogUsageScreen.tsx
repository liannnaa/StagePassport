import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import SearchablePickerField, {
  PickerOption,
} from '../components/SearchablePickerField';
import AddVenueModal from '../../venues/components/AddVenueModal';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import { colors, radius, spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CatalogUsage'>;

type ReplacementValue =
  | { type: 'billing'; id: string; label: string; billing: string }
  | { type: 'tag'; id: string; label: string; tag: string }
  | { type: 'venue'; id: string; label: string; venue: string; city: string }
  | { type: 'genre'; id: string; label: string; genre: string }
  | { type: 'subGenre'; id: string; label: string; subGenre: string };

export default function CatalogUsageScreen({ route, navigation }: Props) {
  const params = route.params;

  const {
    billingOptions,
    tagOptions,
    venueOptions,
    genreOptions,
    getSubGenreOptionsByGenreId,
    getCatalogUsage,
    removeCatalogValueFromPerformance,
    replaceCatalogValue,
    addBillingOption,
    addTagOption,
    addVenueOption,
    addGenreOption,
    addSubGenreOption,
    deleteBillingOption,
    deleteTagOption,
    deleteVenueOption,
    deleteGenreOption,
    deleteSubGenreOption,
  } = usePerformances();

  const [replacement, setReplacement] = useState<ReplacementValue | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [pendingVenueSearchText, setPendingVenueSearchText] = useState('');

  const usage = useMemo(
    () =>
      getCatalogUsage(params.type, params.id, {
        genreId: params.type === 'subGenre' ? params.genreId : undefined,
      }),
    [getCatalogUsage, params]
  );

  const replacementOptions = useMemo<PickerOption[]>(() => {
    if (params.type === 'billing') {
      return billingOptions
        .filter((item) => item.id !== params.id)
        .map((item) => ({
          id: item.id,
          title: item.name,
        }));
    }

    if (params.type === 'tag') {
      return tagOptions
        .filter((item) => item.id !== params.id)
        .map((item) => ({
          id: item.id,
          title: item.name,
        }));
    }

    if (params.type === 'venue') {
      return venueOptions
        .filter((item) => item.id !== params.id)
        .map((item) => ({
          id: item.id,
          title: item.venueName,
          subtitle: item.city,
        }));
    }

    if (params.type === 'genre') {
      return genreOptions
        .filter((item) => item.id !== params.id)
        .map((item) => ({
          id: item.id,
          title: item.name,
        }));
    }

    return getSubGenreOptionsByGenreId(params.genreId)
      .filter((item) => item.id !== params.id)
      .map((item) => ({
        id: item.id,
        title: item.name,
      }));
  }, [
    params,
    billingOptions,
    tagOptions,
    venueOptions,
    genreOptions,
    getSubGenreOptionsByGenreId,
  ]);

  function handleSelectReplacement(option: PickerOption) {
    if (params.type === 'billing') {
      const selected = billingOptions.find((item) => item.id === option.id);
      if (!selected) return;

      setReplacement({
        type: 'billing',
        id: selected.id,
        label: selected.name,
        billing: selected.name,
      });
      return;
    }

    if (params.type === 'tag') {
      const selected = tagOptions.find((item) => item.id === option.id);
      if (!selected) return;

      setReplacement({
        type: 'tag',
        id: selected.id,
        label: selected.name,
        tag: selected.name,
      });
      return;
    }

    if (params.type === 'venue') {
      const selected = venueOptions.find((item) => item.id === option.id);
      if (!selected) return;

      setReplacement({
        type: 'venue',
        id: selected.id,
        label: [selected.venueName, selected.city]
          .filter((value) => value.trim().length > 0)
          .join(' • '),
        venue: selected.venueName,
        city: selected.city,
      });
      return;
    }

    if (params.type === 'genre') {
      const selected = genreOptions.find((item) => item.id === option.id);
      if (!selected) return;

      setReplacement({
        type: 'genre',
        id: selected.id,
        label: selected.name,
        genre: selected.name,
      });
      return;
    }

    const selected = getSubGenreOptionsByGenreId(params.genreId).find(
      (item) => item.id === option.id
    );
    if (!selected) return;

    setReplacement({
      type: 'subGenre',
      id: selected.id,
      label: selected.name,
      subGenre: selected.name,
    });
  }

  async function handleAddNew(searchText: string) {
    const trimmed = searchText.trim();
    if (!trimmed) return;

    try {
      if (params.type === 'billing') {
        const added = await addBillingOption(trimmed);

        setReplacement({
          type: 'billing',
          id: added.id,
          label: added.name,
          billing: added.name,
        });

        return;
      }

      if (params.type === 'tag') {
        const added = await addTagOption(trimmed);

        setReplacement({
          type: 'tag',
          id: added.id,
          label: added.name,
          tag: added.name,
        });

        return;
      }

      if (params.type === 'genre') {
        const added = await addGenreOption(trimmed);

        setReplacement({
          type: 'genre',
          id: added.id,
          label: added.name,
          genre: added.name,
        });

        return;
      }

      if (params.type === 'subGenre') {
        const added = await addSubGenreOption(
          params.genreId,
          params.genreName,
          trimmed
        );

        setReplacement({
          type: 'subGenre',
          id: added.id,
          label: added.name,
          subGenre: added.name,
        });

        return;
      }

      if (params.type === 'venue') {
        setPendingVenueSearchText(trimmed);
        setShowAddVenueModal(true);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Unable to add option', message);
    }
  }

  async function handleUpdateAll() {
    if (!replacement) {
      Alert.alert(
        'Choose replacement',
        'Choose an existing option or add a new one first.'
      );
      return;
    }

    try {
      setIsUpdating(true);

      if (params.type === 'billing' && replacement.type === 'billing') {
        await replaceCatalogValue('billing', params.id, {
          billing: replacement.billing,
        });
        await deleteBillingOption(params.id);
      }

      if (params.type === 'tag' && replacement.type === 'tag') {
        await replaceCatalogValue('tag', params.id, {
          tag: replacement.tag,
        });
        await deleteTagOption(params.id);
      }

      if (params.type === 'venue' && replacement.type === 'venue') {
        await replaceCatalogValue('venue', params.id, {
          venue: replacement.venue,
          city: replacement.city,
        });
        await deleteVenueOption(params.id);
      }

      if (params.type === 'genre' && replacement.type === 'genre') {
        await replaceCatalogValue('genre', params.id, {
          genre: replacement.genre,
        });
        await deleteGenreOption(params.id);
      }

      if (params.type === 'subGenre' && replacement.type === 'subGenre') {
        await replaceCatalogValue('subGenre', params.id, {
          genreId: params.genreId,
          subGenre: replacement.subGenre,
        });
        await deleteSubGenreOption(params.id);
      }

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Update failed', message);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleRemoveFromPerformance(performanceId: string, artist: string) {
    Alert.alert(
      'Remove from performance',
      `Are you sure you want to remove this ${params.type} from ${artist}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCatalogValueFromPerformance(performanceId, params.type, params.id);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Something went wrong.';
              Alert.alert('Remove failed', message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title="Catalog Usage"
      subtitle={`${params.label} • ${usage.length} ${
        usage.length === 1 ? 'performance' : 'performances'
      }`}
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Usage</Text>
          <Text style={styles.cardSubtitle}>
            Choose an existing option or create a new one to replace this value
            across all matching performances.
          </Text>

          <SearchablePickerField
            label="Replacement"
            selectedLabel={replacement?.label ?? ''}
            placeholder="Choose or add replacement"
            options={replacementOptions}
            onSelect={handleSelectReplacement}
            onClear={() => setReplacement(null)}
            onAddNew={handleAddNew}
            addNewLabel="Add replacement"
          />

          <Pressable
            style={[
              styles.primaryButton,
              isUpdating && styles.disabledButton,
            ]}
            onPress={handleUpdateAll}
            disabled={isUpdating}
          >
            <Text style={styles.primaryButtonText}>
              {isUpdating ? 'Updating...' : 'Update All Performances'}
            </Text>
          </Pressable>
        </View>

        {usage.length === 0 ? (
          <EmptyState
            title="No usage found"
            body="This catalog item is not used by any performance."
          />
        ) : (
          usage.map((performance) => (
            <View key={performance.id} style={styles.usageCard}>
              <Text style={styles.performanceTitle}>{performance.artist}</Text>

              <Text style={styles.performanceSubtitle}>
                {[performance.showName, performance.venue, performance.city]
                  .filter((value) => value.trim().length > 0)
                  .join(' • ')}
              </Text>

              <Text style={styles.performanceDate}>{performance.date}</Text>

              <Pressable
                style={styles.removeButton}
                onPress={() =>
                  handleRemoveFromPerformance(performance.id, performance.artist)
                }
              >
                <Text style={styles.removeButtonText}>
                  Remove from This Performance
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </AppScrollView>

      <AddVenueModal
        visible={showAddVenueModal}
        initialVenueName={pendingVenueSearchText}
        onClose={() => setShowAddVenueModal(false)}
        onSave={async (venueName, city) => {
          try {
            const added = await addVenueOption(venueName, city);

            setReplacement({
              type: 'venue',
              id: added.id,
              label: [added.venueName, added.city]
                .filter((value) => value.trim().length > 0)
                .join(' • '),
              venue: added.venueName,
              city: added.city,
            });

            setShowAddVenueModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add venue', message);
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.accentTextOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  usageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  performanceTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  performanceSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  performanceDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
  },
});