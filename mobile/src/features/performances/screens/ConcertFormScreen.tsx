import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppScrollView from '../../../components/AppScrollView';
import ScreenContainer from '../../../components/ScreenContainer';
import TopSheetModal from '../../../components/TopSheetModal';
import PickerField from '../../../components/PickerField';
import SearchablePickerField, {
  PickerOption,
} from '../../catalog/components/SearchablePickerField';
import AddVenueModal from '../../venues/components/AddVenueModal';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { formatStoredDate, parseStoredDate } from '../utils/dates';
import { colors, radius, spacing } from '../../../theme/tokens';
import FormField from '../components/FormField';
import TagMultiSelectField from '../../tags/components/TagMultiSelectField';
import { addUniqueTag, removeTag } from '../../tags/utils/tagSelection';
import { useDirectCatalogAdd } from '../../catalog/hooks/useDirectCatalogAdd';
import AddBillingModal from '../../billings/components/AddBillingModal';
import AddTagModal from '../../tags/components/AddTagModal';
import AddGenreModal from '../../genres/components/AddGenreModal';
import AddSubGenreModal from '../../genres/components/AddSubGenreModal';
import {
  findExistingOption,
  findExistingVenueOption,
} from '../../catalog/utils/catalogOptionMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'ConcertForm'>;

type ConcertArtistRow = {
  id: string;
  performanceId?: string;
  artist: string;
  billing: string;
  tags: string[];
  genre: string;
  subGenre: string;
  selectedGenreId: string | null;
  genreWasEdited: boolean;
};

function createEmptyRow(): ConcertArtistRow {
  return {
    id: Math.random().toString(36).slice(2),
    performanceId: undefined,
    artist: '',
    billing: '',
    tags: [],
    genre: '',
    subGenre: '',
    selectedGenreId: null,
    genreWasEdited: false,
  };
}

export default function ConcertFormScreen({ route, navigation }: Props) {
  const {
    venueOptions,
    genreOptions,
    billingOptions,
    tagOptions,
    getSubGenreOptionsByGenreId,
    getArtistGenreDefault,
    syncGenresForArtist,
    addVenueOption,
    addGenreOption,
    addSubGenreOption,
    addBillingOption,
    addTagOption,
    addConcertPerformances,
    updateConcertPerformances,
    getPerformancesByShowId,
    deleteConcertPerformances,
  } = usePerformances();

  const { addDirectly } = useDirectCatalogAdd();

  const isEditMode = route.params.mode === 'edit';

  function getGenreIdByName(genreName: string): string | null {
    if (!genreName.trim()) return null;

    return (
      genreOptions.find(
        (option) =>
          option.name.trim().toLowerCase() === genreName.trim().toLowerCase()
      )?.id ?? null
    );
  }

  const existingPerformances = useMemo(() => {
    if (!isEditMode) return [];
    return getPerformancesByShowId(route.params.showId);
  }, [getPerformancesByShowId, isEditMode, route.params]);

  const initialValues = useMemo(() => {
    const first = existingPerformances[0];

    return {
      showName: first?.showName ?? '',
      venue: first?.venue ?? '',
      city: first?.city ?? '',
      date: first ? parseStoredDate(first.date) : new Date(),
      rows:
        existingPerformances.length > 0
          ? existingPerformances.map((performance) => ({
              id: performance.id,
              performanceId: performance.id,
              artist: performance.artist,
              billing: performance.billing,
              tags: performance.tags,
              genre: performance.genre,
              subGenre: performance.subGenre,
              selectedGenreId: getGenreIdByName(performance.genre),
              genreWasEdited: false,
            }))
          : [createEmptyRow()],
    };
  }, [existingPerformances, genreOptions]);

  const [showName, setShowName] = useState(initialValues.showName);
  const [venue, setVenue] = useState(initialValues.venue);
  const [city, setCity] = useState(initialValues.city);
  const [date, setDate] = useState(initialValues.date);
  const [draftDate, setDraftDate] = useState(initialValues.date);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddBillingModalVisible, setIsAddBillingModalVisible] = useState(false);
  const [pendingBillingSearchText, setPendingBillingSearchText] = useState('');
  const [activeRowIdForBilling, setActiveRowIdForBilling] = useState<string | null>(null);

  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [pendingTagSearchText, setPendingTagSearchText] = useState('');
  const [activeRowIdForTag, setActiveRowIdForTag] = useState<string | null>(null);

  const [isAddGenreModalVisible, setIsAddGenreModalVisible] = useState(false);
  const [pendingGenreSearchText, setPendingGenreSearchText] = useState('');
  const [activeRowIdForGenre, setActiveRowIdForGenre] = useState<string | null>(null);

  const [isAddSubGenreModalVisible, setIsAddSubGenreModalVisible] = useState(false);
  const [pendingSubGenreSearchText, setPendingSubGenreSearchText] = useState('');
  const [activeRowIdForSubGenre, setActiveRowIdForSubGenre] = useState<string | null>(null);

  const [rows, setRows] = useState<ConcertArtistRow[]>(initialValues.rows);

  const [isAddVenueModalVisible, setIsAddVenueModalVisible] = useState(false);
  const [pendingVenueSearchText, setPendingVenueSearchText] = useState('');

  useEffect(() => {
    if (!isEditMode) return;

    setShowName(initialValues.showName);
    setVenue(initialValues.venue);
    setCity(initialValues.city);
    setDate(initialValues.date);
    setDraftDate(initialValues.date);
    setRows(initialValues.rows);
  }, [isEditMode, initialValues]);

  const formattedDate = formatStoredDate(date);

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

  function updateRow(id: string, updates: Partial<ConcertArtistRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  }

  function addTagToRow(rowId: string, tagName: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              tags: addUniqueTag(row.tags, tagName),
            }
          : row
      )
    );
  }

  function removeTagFromRow(rowId: string, tagName: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              tags: removeTag(row.tags, tagName),
            }
          : row
      )
    );
  }

  function addArtistRow() {
    if (isSaving) return;
    setRows((current) => [...current, createEmptyRow()]);
  }

  function removeArtistRow(id: string) {
    if (isSaving || rows.length === 1) return;
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function handleArtistChange(rowId: string, artistName: string) {
    const defaultGenre = getArtistGenreDefault(artistName);

    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const nextGenre = row.genre.trim() || defaultGenre?.genre || '';
        const nextSubGenre = row.subGenre.trim() || defaultGenre?.subGenre || '';

        return {
          ...row,
          artist: artistName,
          genre: nextGenre,
          subGenre: nextSubGenre,
          selectedGenreId: getGenreIdByName(nextGenre),
          genreWasEdited: row.genreWasEdited,
        };
      })
    );
  }

  function getRowsWithEditedGenres() {
    const rowsWithEditedGenres = rows.filter(
      (row) => row.genreWasEdited && row.artist.trim() && row.genre.trim()
    );

    const seenArtists = new Set<string>();

    return rowsWithEditedGenres.filter((row) => {
      const artistKey = row.artist.trim().toLowerCase();

      if (seenArtists.has(artistKey)) {
        return false;
      }

      seenArtists.add(artistKey);
      return true;
    });
  }

  async function syncEditedArtistGenres() {
    const rowsToSync = getRowsWithEditedGenres();

    await Promise.all(
      rowsToSync.map((row) =>
        syncGenresForArtist(row.artist, row.genre, row.subGenre)
      )
    );
  }

  const billingPickerOptions = useMemo<PickerOption[]>(() => {
    return billingOptions.map((option) => ({
      id: option.id,
      title: option.name,
    }));
  }, [billingOptions]);

  const tagPickerOptions = useMemo<PickerOption[]>(() => {
    return tagOptions.map((option) => ({
      id: option.id,
      title: option.name,
    }));
  }, [tagOptions]);

  const venuePickerOptions = useMemo<PickerOption[]>(() => {
    return venueOptions.map((option) => ({
      id: option.id,
      title: option.venueName,
      subtitle: option.city,
    }));
  }, [venueOptions]);

  const genrePickerOptions = useMemo<PickerOption[]>(() => {
    return genreOptions.map((option) => ({
      id: option.id,
      title: option.name,
    }));
  }, [genreOptions]);

  async function handleSave() {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const payload = {
        shared: {
          showName: showName.trim(),
          venue: venue.trim(),
          city: city.trim(),
          date: formattedDate,
        },
        artists: rows.map((row) => ({
          performanceId: row.performanceId,
          artist: row.artist,
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
        })),
      };

      if (isEditMode) {
        await updateConcertPerformances(route.params.showId, payload);
      } else {
        await addConcertPerformances(payload);
      }

      await syncEditedArtistGenres();

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (!isEditMode) return;

    const editShowId = route.params.mode === 'edit' ? route.params.showId : null;
    if (!editShowId) return;

    Alert.alert(
      'Delete concert',
      'This will delete every performance under this concert. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteConfirmed(editShowId),
        },
      ]
    );
  }

  async function handleDeleteConfirmed(editShowId: string) {
    try {
      setIsSaving(true);
      await deleteConcertPerformances(editShowId);

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Delete failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditMode && existingPerformances.length === 0) {
    return (
      <ScreenContainer
        showHeader
        title="Edit Concert"
        showBackButton
        onBackPress={() => navigation.goBack()}
      >
        <Text style={styles.notFound}>Concert not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      showHeader
      title={isEditMode ? 'Edit Concert' : 'Add Concert'}
      subtitle={
        isEditMode
          ? 'Update shared concert details and artists'
          : 'Add multiple related performances'
      }
      showBackButton
      onBackPress={() => {
        if (isSaving) return;
        navigation.goBack();
      }}
      rightActionLabel="Catalog"
      onRightActionPress={() => {
        if (isSaving) return;
        navigation.navigate('ManageCatalog');
      }}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        <FormField
          label="Show Name *"
          value={showName}
          onChangeText={setShowName}
        />

        <SearchablePickerField
          label="Venue"
          selectedLabel={[venue, city]
            .filter((value) => value.trim().length > 0)
            .join(' • ')}
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
            setPendingVenueSearchText(searchText);
            setIsAddVenueModalVisible(true);
          }}
        />

        <PickerField
          label="Date *"
          value={formattedDate}
          placeholder="Select date"
          onPress={openDatePicker}
        />

        <Text style={styles.lockedHelperText}>
          Changes to show name, venue, city, and date will update every performance in this concert.
        </Text>

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
              if (selectedDate) {
                setDraftDate(selectedDate);
              }
            }}
          />
        </TopSheetModal>

        {rows.map((row, index) => {
          const availableSubGenreOptions = row.selectedGenreId
            ? getSubGenreOptionsByGenreId(row.selectedGenreId)
            : [];

          const subGenrePickerOptions: PickerOption[] =
            availableSubGenreOptions.map((option) => ({
              id: option.id,
              title: option.name,
            }));

          return (
            <View key={row.id} style={styles.artistCard}>
              <View style={styles.artistCardHeader}>
                <Text style={styles.artistCardTitle}>Artist {index + 1}</Text>

                {rows.length > 1 ? (
                  <TouchableOpacity
                    onPress={() => removeArtistRow(row.id)}
                    disabled={isSaving}
                  >
                    <Text style={styles.removeArtistText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <FormField
                label="Artist *"
                value={row.artist}
                onChangeText={(value) => handleArtistChange(row.id, value)}
              />

              <SearchablePickerField
                label="Billing"
                selectedLabel={row.billing}
                placeholder="Choose or add a billing"
                options={billingPickerOptions}
                onSelect={(option) => {
                  const selected = billingOptions.find((item) => item.id === option.id);
                  if (!selected) return;

                  updateRow(row.id, { billing: selected.name });
                }}
                onClear={() => updateRow(row.id, { billing: '' })}
                onAddNew={(searchText) => {
                  const trimmed = searchText.trim();

                  if (!trimmed) {
                    setActiveRowIdForBilling(row.id);
                    setPendingBillingSearchText('');
                    setIsAddBillingModalVisible(true);
                    return;
                  }

                  const existing = findExistingOption(billingPickerOptions, trimmed);
                  if (existing) {
                    Alert.alert('Using existing option');
                    updateRow(row.id, { billing: existing.title });
                    return;
                  }

                  addDirectly({
                    value: trimmed,
                    addOption: addBillingOption,
                    onSuccess: (added) => updateRow(row.id, { billing: added.name }),
                    errorTitle: 'Unable to add billing',
                  });
                }}
                addNewLabel="Add billing"
              />

              <TagMultiSelectField
                tags={row.tags}
                options={tagPickerOptions}
                onAddTag={(tagName) => addTagToRow(row.id, tagName)}
                onRemoveTag={(tagName) => removeTagFromRow(row.id, tagName)}
                onClearTags={() => updateRow(row.id, { tags: [] })}
                onAddNew={(searchText) => {
                  const trimmed = searchText.trim();
                  if (!trimmed) {
                    setPendingTagSearchText('');
                    setActiveRowIdForTag(row.id);
                    setIsAddTagModalVisible(true);
                    return;
                  }

                  const existing = findExistingOption(tagPickerOptions, trimmed);
                  if (existing) {
                    Alert.alert('Using existing option');
                    addTagToRow(row.id, existing.title);
                    return;
                  }

                  addDirectly({
                    value: trimmed,
                    addOption: addTagOption,
                    onSuccess: (added) => addTagToRow(row.id, added.name),
                    errorTitle: 'Unable to add tag',
                  });
                }}
              />

              <SearchablePickerField
                label="Genre"
                selectedLabel={row.genre}
                placeholder="Choose or add a genre"
                options={genrePickerOptions}
                onSelect={(option) => {
                  const selected = genreOptions.find((g) => g.id === option.id);
                  if (!selected) return;

                  updateRow(row.id, {
                    genre: selected.name,
                    selectedGenreId: selected.id,
                    subGenre: '',
                    genreWasEdited: true,
                  });
                }}
                onClear={() => {
                  updateRow(row.id, {
                    genre: '',
                    selectedGenreId: null,
                    subGenre: '',
                    genreWasEdited: true,
                  });
                }}
                onAddNew={(searchText) => {
                  const trimmed = searchText.trim();
                  if (!trimmed) {
                    setPendingGenreSearchText('');
                    setActiveRowIdForGenre(row.id);
                    setIsAddGenreModalVisible(true);
                    return;
                  }

                  const existing = findExistingOption(genrePickerOptions, trimmed);
                  if (existing) {
                    Alert.alert('Using existing option');
                    updateRow(row.id, {
                      genre: existing.title,
                      selectedGenreId: existing.id,
                      subGenre: '',
                    });
                    return;
                  }

                  addDirectly({
                    value: trimmed,
                    addOption: addGenreOption,
                    onSuccess: (added) =>
                      updateRow(row.id, {
                        genre: added.name,
                        selectedGenreId: added.id,
                        subGenre: '',
                      }),
                    errorTitle: 'Unable to add genre',
                  });
                }}
              />

              <SearchablePickerField
                label="Sub-Genre"
                selectedLabel={row.subGenre}
                placeholder={
                  row.selectedGenreId ? 'Choose or add a sub-genre' : 'Select a genre first'
                }
                options={subGenrePickerOptions}
                disabled={!row.selectedGenreId}
                onSelect={(option) => {
                  const selected = availableSubGenreOptions.find(
                    (item) => item.id === option.id
                  );
                  if (!selected) return;

                  updateRow(row.id, {
                    subGenre: selected.name,
                    genreWasEdited: true,
                  });
                }}
                onClear={() => {
                  updateRow(row.id, {
                    subGenre: '',
                    genreWasEdited: true,
                  });
                }}
                onAddNew={(searchText) => {
                  if (!row.selectedGenreId) return;

                  const trimmed = searchText.trim();
                  if (!trimmed) {
                    setPendingSubGenreSearchText('');
                    setActiveRowIdForSubGenre(row.id);
                    setIsAddSubGenreModalVisible(true);
                    return;
                  }

                  const existing = findExistingOption(subGenrePickerOptions, trimmed);
                  if (existing) {
                    Alert.alert('Using existing option');
                    updateRow(row.id, { subGenre: existing.title });
                    return;
                  }

                  addDirectly({
                    value: trimmed,
                    addOption: (name) =>
                      addSubGenreOption(row.selectedGenreId!, row.genre, name),
                    onSuccess: (added) =>
                      updateRow(row.id, {
                        subGenre: added.name,
                        genreWasEdited: true,
                      }),
                    errorTitle: 'Unable to add sub-genre',
                  });
                }}
              />
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.secondaryButton, isSaving && styles.disabledButton]}
          onPress={addArtistRow}
          disabled={isSaving}
        >
          <Text style={styles.secondaryButtonText}>Add Artist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving
              ? isEditMode
                ? 'Saving Concert...'
                : 'Adding Concert...'
              : isEditMode
              ? 'Save Changes'
              : 'Add Concert'}
          </Text>
        </TouchableOpacity>

        {isEditMode ? (
          <TouchableOpacity
            style={[styles.deleteButton, isSaving && styles.disabledButton]}
            onPress={handleDelete}
            disabled={isSaving}
          >
            <Text style={styles.deleteButtonText}>Delete Concert</Text>
          </TouchableOpacity>
        ) : null}
      </AppScrollView>

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
      <AddBillingModal
        visible={isAddBillingModalVisible}
        initialBillingName={pendingBillingSearchText}
        onClose={() => {
          setIsAddBillingModalVisible(false);
          setActiveRowIdForBilling(null);
        }}
        onSave={async (newBillingName) => {
          const existing = findExistingOption(billingPickerOptions, newBillingName);

          if (existing) {
            Alert.alert('Using existing option');

            if (activeRowIdForBilling) {
              updateRow(activeRowIdForBilling, { billing: existing.title });
            }

            setIsAddBillingModalVisible(false);
            setActiveRowIdForBilling(null);
            return;
          }

          try {
            const added = await addBillingOption(newBillingName);

            if (activeRowIdForBilling) {
              updateRow(activeRowIdForBilling, { billing: added.name });
            }

            setIsAddBillingModalVisible(false);
            setActiveRowIdForBilling(null);
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
        onClose={() => {
          setIsAddTagModalVisible(false);
          setActiveRowIdForTag(null);
        }}
        onSave={async (newTagName) => {
          const existing = findExistingOption(tagPickerOptions, newTagName);

          if (existing) {
            Alert.alert('Using existing option');

            if (activeRowIdForTag) {
              addTagToRow(activeRowIdForTag, existing.title);
            }

            setIsAddTagModalVisible(false);
            setActiveRowIdForTag(null);
            return;
          }

          try {
            const added = await addTagOption(newTagName);

            if (activeRowIdForTag) {
              addTagToRow(activeRowIdForTag, added.name);
            }

            setIsAddTagModalVisible(false);
            setActiveRowIdForTag(null);
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
        onClose={() => {
          setIsAddGenreModalVisible(false);
          setActiveRowIdForGenre(null);
        }}
        onSave={async (newGenreName) => {
          const existing = findExistingOption(genrePickerOptions, newGenreName);

          if (existing) {
            Alert.alert('Using existing option');

            if (activeRowIdForGenre) {
              updateRow(activeRowIdForGenre, {
                genre: existing.title,
                selectedGenreId: existing.id,
                subGenre: '',
                genreWasEdited: true,
              });
            }

            setIsAddGenreModalVisible(false);
            setActiveRowIdForGenre(null);
            return;
          }

          try {
            const added = await addGenreOption(newGenreName);

            if (activeRowIdForGenre) {
              updateRow(activeRowIdForGenre, {
                genre: added.name,
                selectedGenreId: added.id,
                subGenre: '',
                genreWasEdited: true,
              });
            }

            setIsAddGenreModalVisible(false);
            setActiveRowIdForGenre(null);
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
        genreName={rows.find((row) => row.id === activeRowIdForSubGenre)?.genre ?? ''}
        initialSubGenreName={pendingSubGenreSearchText}
        onClose={() => {
          setIsAddSubGenreModalVisible(false);
          setActiveRowIdForSubGenre(null);
        }}
        onSave={async (newSubGenreName) => {
          const activeRow = rows.find((row) => row.id === activeRowIdForSubGenre);

          if (!activeRow?.selectedGenreId) return;

          const subGenrePickerOptions = getSubGenreOptionsByGenreId(
            activeRow.selectedGenreId
          ).map((option) => ({
            id: option.id,
            title: option.name,
          }));

          const existing = findExistingOption(subGenrePickerOptions, newSubGenreName);

          if (existing) {
            Alert.alert('Using existing option');

            updateRow(activeRow.id, {
              subGenre: existing.title,
              genreWasEdited: true,
            });

            setIsAddSubGenreModalVisible(false);
            setActiveRowIdForSubGenre(null);
            return;
          }

          try {
            const added = await addSubGenreOption(
              activeRow.selectedGenreId,
              activeRow.genre,
              newSubGenreName
            );

            updateRow(activeRow.id, {
              subGenre: added.name,
              genreWasEdited: true,
            });

            setIsAddSubGenreModalVisible(false);
            setActiveRowIdForSubGenre(null);
          } catch (error) {
            Alert.alert(
              'Unable to add sub-genre',
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
  artistCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  artistCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  artistCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  removeArtistText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.destructive,
  },
  lockedHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -6,
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
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
  disabledButton: {
    opacity: 0.6,
  },
  notFound: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.lg,
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
  tagChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagChipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  tagChipRemove: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  multiSelectHelperText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});