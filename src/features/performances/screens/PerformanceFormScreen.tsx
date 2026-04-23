import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppScrollView from '../../../components/AppScrollView';
import ScreenContainer from '../../../components/ScreenContainer';
import TopSheetModal from '../../../components/TopSheetModal';
import PickerField from '../../../components/PickerField';

import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { buildShowId } from '../utils/showId';
import { formatStoredDate, parseStoredDate } from '../utils/dates';
import { colors, radius, spacing } from '../../../theme/tokens';

import SearchablePickerField, {
  PickerOption,
} from '../../catalog/components/SearchablePickerField';

import AddVenueModal from '../../venues/components/AddVenueModal';
import AddBillingModal from '../../billings/components/AddBillingModal';
import AddTagModal from '../../tags/components/AddTagModal';
import AddGenreModal from '../../genres/components/AddGenreModal';
import AddSubGenreModal from '../../genres/components/AddSubGenreModal';

import { findMatchingPerformanceByShowId } from '../../venues/utils/venueMatching';
import { findMatchingPerformanceByArtist } from '../../genres/utils/artistGenreMatching';

import FormField from '../components/FormField';
import TagMultiSelectField from '../../tags/components/TagMultiSelectField';
import { addUniqueTag, removeTag } from '../../tags/utils/tagSelection';
import { useDirectCatalogAdd } from '../../catalog/hooks/useDirectCatalogAdd';
import {
  findExistingOption,
  findExistingVenueOption,
} from '../../catalog/utils/catalogOptionMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceForm'>;

export default function PerformanceFormScreen({ route, navigation }: Props) {
  const {
    performances,
    venueOptions,
    genreOptions,
    addVenueOption,
    addGenreOption,
    getSubGenreOptionsByGenreId,
    addSubGenreOption,
    addPerformance,
    syncGenresForArtist,
    getPerformanceById,
    billingOptions,
    addBillingOption,
    tagOptions,
    addTagOption,
    deletePerformance,
    updateConcertPerformances,
  } = usePerformances();

  const { addDirectly } = useDirectCatalogAdd();

  const existingPerformance =
    route.params.mode === 'edit'
      ? getPerformanceById(route.params.performanceId)
      : undefined;

  const isEditMode = route.params.mode === 'edit';

  const initialValues = useMemo(
    () => ({
      artist: existingPerformance?.artist ?? '',
      venue: existingPerformance?.venue ?? '',
      city: existingPerformance?.city ?? '',
      date: existingPerformance
        ? parseStoredDate(existingPerformance.date)
        : new Date(),
      billing: existingPerformance?.billing ?? '',
      tags: existingPerformance?.tags ?? [],
      genre: existingPerformance?.genre ?? '',
      subGenre: existingPerformance?.subGenre ?? '',
      showName: existingPerformance?.showName ?? '',
    }),
    [existingPerformance]
  );

  const [artist, setArtist] = useState(initialValues.artist);
  const [venue, setVenue] = useState(initialValues.venue);
  const [city, setCity] = useState(initialValues.city);
  const [date, setDate] = useState(initialValues.date);
  const [draftDate, setDraftDate] = useState(initialValues.date);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [billing, setBilling] = useState(initialValues.billing);
  const [tags, setTags] = useState<string[]>(initialValues.tags);
  const [genre, setGenre] = useState(initialValues.genre);
  const [subGenre, setSubGenre] = useState(initialValues.subGenre);
  const [showName, setShowName] = useState(initialValues.showName);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isAddVenueModalVisible, setIsAddVenueModalVisible] = useState(false);
  const [pendingVenueSearchText, setPendingVenueSearchText] = useState('');

  const [isAddBillingModalVisible, setIsAddBillingModalVisible] = useState(false);
  const [pendingBillingSearchText, setPendingBillingSearchText] = useState('');

  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [pendingTagSearchText, setPendingTagSearchText] = useState('');

  const [isAddGenreModalVisible, setIsAddGenreModalVisible] = useState(false);
  const [pendingGenreSearchText, setPendingGenreSearchText] = useState('');

  const [isAddSubGenreModalVisible, setIsAddSubGenreModalVisible] = useState(false);
  const [pendingSubGenreSearchText, setPendingSubGenreSearchText] = useState('');

  const formattedDate = formatStoredDate(date);
  const derivedShowId = buildShowId(showName, formattedDate);

  useEffect(() => {
    if (!showName.trim()) return;

    const matched = findMatchingPerformanceByShowId(
      performances,
      existingPerformance?.id,
      derivedShowId
    );

    if (matched) {
      setVenue(matched.venue);
      setCity(matched.city);
    }
  }, [derivedShowId, performances, existingPerformance?.id, showName]);

  useEffect(() => {
    if (!genre.trim()) {
      setSelectedGenreId(null);
      setSubGenre('');
      return;
    }

    const matchedGenre = genreOptions.find(
      (option) => option.name.toLowerCase() === genre.trim().toLowerCase()
    );

    if (!matchedGenre) {
      setSelectedGenreId(null);
      setSubGenre('');
      return;
    }

    setSelectedGenreId(matchedGenre.id);

    if (!subGenre.trim()) return;

    const subGenreOptions = getSubGenreOptionsByGenreId(matchedGenre.id);
    const subGenreStillValid = subGenreOptions.some(
      (option) => option.name.toLowerCase() === subGenre.trim().toLowerCase()
    );

    if (!subGenreStillValid) {
      setSubGenre('');
    }
  }, [genre, subGenre, genreOptions, getSubGenreOptionsByGenreId]);

  useEffect(() => {
    if (!artist.trim()) return;

    const matched = findMatchingPerformanceByArtist(
      performances,
      existingPerformance?.id,
      artist
    );

    if (matched && matched.genre.trim()) {
      setGenre(matched.genre);
      setSubGenre(matched.subGenre ?? '');
    }
  }, [artist, performances, existingPerformance?.id]);

  function openDatePicker() {
    setDraftDate(date);
    setShowDatePicker(true);
  }

  function cancelDatePicker() {
    setDraftDate(date);
    setShowDatePicker(false);
  }

  function confirmDatePicker() {
    setDate(draftDate);
    setShowDatePicker(false);
  }

  function addTag(tagName: string) {
    setTags((current) => addUniqueTag(current, tagName));
  }

  function removeSelectedTag(tagName: string) {
    setTags((current) => removeTag(current, tagName));
  }

  const billingPickerOptions = useMemo<PickerOption[]>(
    () => billingOptions.map((option) => ({ id: option.id, title: option.name })),
    [billingOptions]
  );

  const tagPickerOptions = useMemo<PickerOption[]>(
    () => tagOptions.map((option) => ({ id: option.id, title: option.name })),
    [tagOptions]
  );

  const venuePickerOptions = useMemo<PickerOption[]>(
    () =>
      venueOptions.map((option) => ({
        id: option.id,
        title: option.venueName,
        subtitle: option.city,
      })),
    [venueOptions]
  );

  const genrePickerOptions = useMemo<PickerOption[]>(
    () => genreOptions.map((option) => ({ id: option.id, title: option.name })),
    [genreOptions]
  );

  const availableSubGenreOptions = useMemo(() => {
    if (!selectedGenreId) return [];
    return getSubGenreOptionsByGenreId(selectedGenreId);
  }, [selectedGenreId, getSubGenreOptionsByGenreId]);

  const subGenrePickerOptions = useMemo<PickerOption[]>(
    () => availableSubGenreOptions.map((option) => ({ id: option.id, title: option.name })),
    [availableSubGenreOptions]
  );

  async function handleSave() {
    if (isSaving) return;

    if (!artist.trim() || !showName.trim()) {
      Alert.alert('Missing required fields', 'Artist and show name are required.');
      return;
    }

    const payload = {
      artist: artist.trim(),
      venue: venue.trim(),
      city: city.trim(),
      date: formattedDate,
      billing: billing.trim(),
      tags,
      genre: genre.trim(),
      subGenre: subGenre.trim(),
      showName: showName.trim(),
    };

    try {
      setIsSaving(true);

      if (isEditMode && existingPerformance) {
        const concertRows = performances.filter(
          (item) => item.showId === existingPerformance.showId
        );

        await updateConcertPerformances(existingPerformance.showId, {
          shared: {
            showName: payload.showName,
            venue: payload.venue,
            city: payload.city,
            date: payload.date,
          },
          artists: concertRows.map((item) => ({
            performanceId: item.id,
            artist: item.id === existingPerformance.id ? payload.artist : item.artist,
            billing: item.id === existingPerformance.id ? payload.billing : item.billing,
            tags: item.id === existingPerformance.id ? payload.tags : item.tags,
            genre: item.id === existingPerformance.id ? payload.genre : item.genre,
            subGenre:
              item.id === existingPerformance.id ? payload.subGenre : item.subGenre,
          })),
        });
      } else {
        await addPerformance(payload);
      }

      await syncGenresForArtist(artist.trim(), genre.trim(), subGenre.trim());
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (isSaving || !isEditMode || !existingPerformance) return;

    Alert.alert(
      'Delete performance',
      `Are you sure you want to delete ${existingPerformance.artist}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await deletePerformance(existingPerformance.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Delete failed',
                error instanceof Error ? error.message : 'Something went wrong.'
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title={isEditMode ? 'Edit Performance' : 'Add Performance'}
      subtitle={isEditMode ? 'Update performance details' : 'Create a new performance'}
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Catalog"
      onRightActionPress={() => navigation.navigate('ManageCatalog')}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        <FormField label="Artist *" value={artist} onChangeText={setArtist} />

        <FormField label="Show Name *" value={showName} onChangeText={setShowName} />

        <PickerField
          label="Date *"
          value={formattedDate}
          placeholder="Select date"
          onPress={openDatePicker}
        />

        <TopSheetModal
          visible={showDatePicker}
          title="Select date"
          onClose={cancelDatePicker}
          onConfirm={confirmDatePicker}
        >
          <DateTimePicker
            value={draftDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            onChange={(_, selectedDate) => {
              if (selectedDate) setDraftDate(selectedDate);
            }}
          />
        </TopSheetModal>

        <SearchablePickerField
          label="Billing"
          selectedLabel={billing}
          placeholder="Choose or add a billing"
          options={billingPickerOptions}
          onSelect={(option) => {
            const selected = billingOptions.find((item) => item.id === option.id);
            if (selected) setBilling(selected.name);
          }}
          onClear={() => setBilling('')}
          onAddNew={(searchText) => {
            const trimmed = searchText.trim();
            if (!trimmed) {
              setPendingBillingSearchText('');
              setIsAddBillingModalVisible(true);
              return;
            }

            const existing = findExistingOption(billingPickerOptions, trimmed);

            if (existing) {
              Alert.alert('Using existing option');
              setBilling(existing.title);
              return;
            }

            addDirectly({
              value: trimmed,
              addOption: addBillingOption,
              onSuccess: (added) => setBilling(added.name),
              errorTitle: 'Unable to add billing',
            });
          }}
          addNewLabel="Add billing"
        />

        <TagMultiSelectField
          tags={tags}
          options={tagPickerOptions}
          onAddTag={addTag}
          onRemoveTag={removeSelectedTag}
          onClearTags={() => setTags([])}
          onAddNew={(searchText) => {
            const trimmed = searchText.trim();

            if (!trimmed) {
              setPendingTagSearchText('');
              setIsAddTagModalVisible(true);
              return;
            }

            const existing = findExistingOption(tagPickerOptions, trimmed);

            if (existing) {
              Alert.alert('Using existing option');
              addTag(existing.title);
              return;
            }

            addDirectly({
              value: trimmed,
              addOption: addTagOption,
              onSuccess: (added) => addTag(added.name),
              errorTitle: 'Unable to add tag',
            });
          }}
        />

        <SearchablePickerField
          label="Venue"
          selectedLabel={[venue, city].filter((value) => value.trim()).join(' • ')}
          placeholder="Choose or add a venue"
          options={venuePickerOptions}
          onSelect={(option) => {
            const selected = venueOptions.find((item) => item.id === option.id);
            if (!selected) return;

            setVenue(selected.venueName);
            setCity(selected.city);
          }}
          onClear={() => {
            setVenue('');
            setCity('');
          }}
          onAddNew={(searchText) => {
            const trimmed = searchText.trim();

            if (!trimmed) {
              setPendingVenueSearchText('');
              setIsAddVenueModalVisible(true);
              return;
            }

            const existing = findExistingVenueOption(venuePickerOptions, trimmed);

            if (existing) {
              Alert.alert('Using existing option');
              setVenue(existing.title);
              setCity(existing.subtitle ?? '');
              return;
            }

            setPendingVenueSearchText(trimmed);
            setIsAddVenueModalVisible(true);
          }}
        />

        {showName.trim() ? (
          <Text style={styles.lockedHelperText}>
            Saving will update venue for all performances under this concert.
          </Text>
        ) : null}

        <SearchablePickerField
          label="Genre"
          selectedLabel={genre}
          placeholder="Choose or add a genre"
          options={genrePickerOptions}
          onSelect={(option) => {
            const selected = genreOptions.find((item) => item.id === option.id);
            if (!selected) return;

            setGenre(selected.name);
            setSelectedGenreId(selected.id);
            setSubGenre('');
          }}
          onClear={() => {
            setGenre('');
            setSelectedGenreId(null);
            setSubGenre('');
          }}
          onAddNew={(searchText) => {
            const trimmed = searchText.trim();

            if (!trimmed) {
              setPendingGenreSearchText('');
              setIsAddGenreModalVisible(true);
              return;
            }

            const existing = findExistingOption(genrePickerOptions, trimmed);

            if (existing) {
              Alert.alert('Using existing option');
              setGenre(existing.title);
              setSelectedGenreId(existing.id);
              setSubGenre('');
              return;
            }

            addDirectly({
              value: trimmed,
              addOption: addGenreOption,
              onSuccess: (added) => {
                setGenre(added.name);
                setSelectedGenreId(added.id);
                setSubGenre('');
              },
              errorTitle: 'Unable to add genre',
            });
          }}
        />

        <SearchablePickerField
          label="Sub-Genre"
          selectedLabel={subGenre}
          placeholder={selectedGenreId ? 'Choose or add a sub-genre' : 'Select a genre first'}
          options={subGenrePickerOptions}
          disabled={!selectedGenreId}
          onSelect={(option) => {
            const selected = availableSubGenreOptions.find((item) => item.id === option.id);
            if (selected) setSubGenre(selected.name);
          }}
          onClear={() => setSubGenre('')}
          onAddNew={(searchText) => {
            if (!selectedGenreId) return;

            const trimmed = searchText.trim();

            if (!trimmed) {
              setPendingSubGenreSearchText('');
              setIsAddSubGenreModalVisible(true);
              return;
            }

            const existing = findExistingOption(subGenrePickerOptions, trimmed);

            if (existing) {
              Alert.alert('Using existing option');
              setSubGenre(existing.title);
              return;
            }

            addDirectly({
              value: trimmed,
              addOption: (name) => addSubGenreOption(selectedGenreId, genre, name),
              onSuccess: (added) => setSubGenre(added.name),
              errorTitle: 'Unable to add sub-genre',
            });
          }}
        />

        {artist.trim() ? (
          <Text style={styles.lockedHelperText}>
            Saving will update genre and sub-genre for all performances by this artist.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving
              ? isEditMode
                ? 'Saving Performance...'
                : 'Adding Performance...'
              : isEditMode
              ? 'Save Changes'
              : 'Add Performance'}
          </Text>
        </TouchableOpacity>

        {isEditMode ? (
          <TouchableOpacity
            style={[styles.deleteButton, isSaving && styles.disabledButton]}
            onPress={handleDelete}
            disabled={isSaving}
          >
            <Text style={styles.deleteButtonText}>Delete Performance</Text>
          </TouchableOpacity>
        ) : null}
      </AppScrollView>

      <AddBillingModal
        visible={isAddBillingModalVisible}
        initialBillingName={pendingBillingSearchText}
        onClose={() => setIsAddBillingModalVisible(false)}
        onSave={async (newBillingName) => {
          const existing = findExistingOption(billingPickerOptions, newBillingName);

          if (existing) {
            Alert.alert('Using existing option');
            setBilling(existing.title);
            setIsAddBillingModalVisible(false);
            return;
          }

          try {
            const added = await addBillingOption(newBillingName);
            setBilling(added.name);
            setIsAddBillingModalVisible(false);
          } catch (error) {
            Alert.alert(
              'Unable to add billing',
              error instanceof Error ? error.message : 'Something went wrong.'
            );
          }
        }}
      />

      <AddTagModal
        visible={isAddTagModalVisible}
        initialTagName={pendingTagSearchText}
        onClose={() => setIsAddTagModalVisible(false)}
        onSave={async (newTagName) => {
          const existing = findExistingOption(tagPickerOptions, newTagName);

          if (existing) {
            Alert.alert('Using existing option');
            addTag(existing.title);
            setIsAddTagModalVisible(false);
            return;
          }

          try {
            const added = await addTagOption(newTagName);
            addTag(added.name);
            setIsAddTagModalVisible(false);
          } catch (error) {
            Alert.alert(
              'Unable to add tag',
              error instanceof Error ? error.message : 'Something went wrong.'
            );
          }
        }}
      />

      <AddGenreModal
        visible={isAddGenreModalVisible}
        initialGenreName={pendingGenreSearchText}
        onClose={() => setIsAddGenreModalVisible(false)}
        onSave={async (newGenreName) => {
          const existing = findExistingOption(genrePickerOptions, newGenreName);

          if (existing) {
            Alert.alert('Using existing option');
            setGenre(existing.title);
            setSelectedGenreId(existing.id);
            setSubGenre('');
            setIsAddGenreModalVisible(false);
            return;
          }

          try {
            const added = await addGenreOption(newGenreName);
            setGenre(added.name);
            setSelectedGenreId(added.id);
            setSubGenre('');
            setIsAddGenreModalVisible(false);
          } catch (error) {
            Alert.alert(
              'Unable to add genre',
              error instanceof Error ? error.message : 'Something went wrong.'
            );
          }
        }}
      />

      <AddSubGenreModal
        visible={isAddSubGenreModalVisible}
        genreName={genre}
        initialSubGenreName={pendingSubGenreSearchText}
        onClose={() => setIsAddSubGenreModalVisible(false)}
        onSave={async (newSubGenreName) => {
          if (!selectedGenreId) return;

          const existing = findExistingOption(subGenrePickerOptions, newSubGenreName);

          if (existing) {
            Alert.alert('Using existing option');
            setSubGenre(existing.title);
            setIsAddSubGenreModalVisible(false);
            return;
          }

          try {
            const added = await addSubGenreOption(selectedGenreId, genre, newSubGenreName);
            setSubGenre(added.name);
            setIsAddSubGenreModalVisible(false);
          } catch (error) {
            Alert.alert(
              'Unable to add sub-genre',
              error instanceof Error ? error.message : 'Something went wrong.'
            );
          }
        }}
      />

      <AddVenueModal
        visible={isAddVenueModalVisible}
        initialVenueName={pendingVenueSearchText}
        onClose={() => setIsAddVenueModalVisible(false)}
        onSave={async (newVenueName, newCity) => {
          const existing = findExistingVenueOption(
            venuePickerOptions,
            newVenueName,
            newCity
          );

          if (existing) {
            Alert.alert('Using existing option');
            setVenue(existing.title);
            setCity(existing.subtitle ?? '');
            setIsAddVenueModalVisible(false);
            return;
          }

          try {
            const added = await addVenueOption(newVenueName, newCity);
            setVenue(added.venueName);
            setCity(added.city);
            setIsAddVenueModalVisible(false);
          } catch (error) {
            Alert.alert(
              'Unable to add venue',
              error instanceof Error ? error.message : 'Something went wrong.'
            );
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
  lockedHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -6,
    marginBottom: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.accentTextOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: spacing.md,
    backgroundColor: colors.destructive,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});