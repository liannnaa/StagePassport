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
import AddGenreModal from '../../genres/components/AddGenreModal';
import AddSubGenreModal from '../../genres/components/AddSubGenreModal';
import AddBillingModal from '../../billings/components/AddBillingModal';
import AddTagModal from '../../tags/components/AddTagModal';
import {
  findExistingOption,
  findExistingVenueOption,
} from '../../catalog/utils/catalogOptionMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'ArtistForm'>;

type ArtistPerformanceRow = {
  id: string;
  performanceId?: string;
  showName: string;
  venue: string;
  city: string;
  date: Date;
  draftDate: Date;
  showDatePicker: boolean;
  billing: string;
  tags: string[];
  genre: string;
  subGenre: string;
  selectedGenreId: string | null;
};

function createEmptyRow(): ArtistPerformanceRow {
  const now = new Date();

  return {
    id: Math.random().toString(36).slice(2),
    performanceId: undefined,
    showName: '',
    venue: '',
    city: '',
    date: now,
    draftDate: now,
    showDatePicker: false,
    billing: '',
    tags: [],
    genre: '',
    subGenre: '',
    selectedGenreId: null,
  };
}

export default function ArtistFormScreen({ route, navigation }: Props) {
  const {
    venueOptions,
    genreOptions,
    billingOptions,
    tagOptions,
    getSubGenreOptionsByGenreId,
    addVenueOption,
    addGenreOption,
    getArtistGenreDefault,
    addSubGenreOption,
    addBillingOption,
    addTagOption,
    addArtistPerformances,
    updateArtistPerformances,
    getPerformancesByArtistName,
    deleteArtistPerformances,
  } = usePerformances();

  const { addDirectly } = useDirectCatalogAdd();

  const isEditMode = route.params.mode === 'edit';

  const existingPerformances = useMemo(() => {
    if (!isEditMode) return [];
    return getPerformancesByArtistName(route.params.artistName);
  }, [getPerformancesByArtistName, isEditMode, route.params]);

  const initialValues = useMemo(() => {
    const first = existingPerformances[0];

    return {
      artist: first?.artist ?? '',
      rows:
        existingPerformances.length > 0
          ? existingPerformances.map((performance) => {
              const parsedDate = parseStoredDate(performance.date);

              return {
                id: performance.id,
                performanceId: performance.id,
                showName: performance.showName,
                venue: performance.venue,
                city: performance.city,
                date: parsedDate,
                draftDate: parsedDate,
                showDatePicker: false,
                billing: performance.billing,
                tags: performance.tags,
                genre: performance.genre,
                subGenre: performance.subGenre,
                selectedGenreId:
                  genreOptions.find(
                    (option) =>
                      option.name.toLowerCase() ===
                      performance.genre.trim().toLowerCase()
                  )?.id ?? null,
              };
            })
          : [createEmptyRow()],
    };
  }, [existingPerformances, genreOptions]);

  const [artist, setArtist] = useState(initialValues.artist);
  const [rows, setRows] = useState<ArtistPerformanceRow[]>(initialValues.rows);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddBillingModalVisible, setIsAddBillingModalVisible] = useState(false);
  const [pendingBillingSearchText, setPendingBillingSearchText] = useState('');
  const [activeRowIdForBilling, setActiveRowIdForBilling] = useState<string | null>(null);

  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [pendingTagSearchText, setPendingTagSearchText] = useState('');
  const [activeRowIdForTag, setActiveRowIdForTag] = useState<string | null>(null);

  const [isAddVenueModalVisible, setIsAddVenueModalVisible] = useState(false);
  const [pendingVenueSearchText, setPendingVenueSearchText] = useState('');
  const [activeRowIdForVenue, setActiveRowIdForVenue] = useState<string | null>(null);

  const [isAddGenreModalVisible, setIsAddGenreModalVisible] = useState(false);
  const [pendingGenreSearchText, setPendingGenreSearchText] = useState('');
  const [activeRowIdForGenre, setActiveRowIdForGenre] = useState<string | null>(null);

  const [isAddSubGenreModalVisible, setIsAddSubGenreModalVisible] = useState(false);
  const [pendingSubGenreSearchText, setPendingSubGenreSearchText] = useState('');
  const [activeRowIdForSubGenre, setActiveRowIdForSubGenre] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) return;

    setArtist(initialValues.artist);
    setRows(initialValues.rows);
  }, [isEditMode, initialValues]);

  function updateRow(id: string, updates: Partial<ArtistPerformanceRow>) {
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

  function addPerformanceRow() {
    if (isSaving) return;
    setRows((current) => [...current, createEmptyRow()]);
  }

  function removePerformanceRow(id: string) {
    if (isSaving || rows.length === 1) return;
    setRows((current) => current.filter((row) => row.id !== id));
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

  function handleArtistNameChange(value: string) {
    setArtist(value);

    const defaultGenre = getArtistGenreDefault(value);
    if (!defaultGenre) return;

    setRows((current) =>
      current.map((row) => {
        if (row.genre.trim()) return row;

        const selectedGenreId =
          genreOptions.find(
            (option) =>
              option.name.trim().toLowerCase() ===
              defaultGenre.genre.trim().toLowerCase()
          )?.id ?? null;

        return {
          ...row,
          genre: defaultGenre.genre,
          subGenre: row.subGenre.trim() || defaultGenre.subGenre,
          selectedGenreId,
        };
      })
    );
  }

  async function handleSave() {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const payload = {
        shared: {
          artist: artist.trim(),
        },
        performances: rows.map((row) => ({
          performanceId: row.performanceId,
          showName: row.showName,
          venue: row.venue,
          city: row.city,
          date: formatStoredDate(row.date),
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
        })),
      };

      if (isEditMode) {
        await updateArtistPerformances(route.params.artistName, payload);
      } else {
        await addArtistPerformances(payload);
      }

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
    const editArtistName = route.params.mode === 'edit' ? route.params.artistName : null;
    if (!editArtistName) return;

    Alert.alert(
      'Delete artist',
      'This will delete every performance under this artist. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteConfirmed(editArtistName),
        },
      ]
    );
  }

  async function handleDeleteConfirmed(editArtistName: string) {
    try {
      setIsSaving(true);
      await deleteArtistPerformances(editArtistName);

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
        title="Edit Artist"
        showBackButton
        onBackPress={() => navigation.goBack()}
      >
        <Text style={styles.notFound}>Artist not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      showHeader
      title={isEditMode ? 'Edit Artist' : 'Add Artist'}
      subtitle={
        isEditMode
          ? 'Update artist and related performances'
          : 'Add multiple performances for one artist'
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
          label="Artist *"
          value={artist}
          onChangeText={handleArtistNameChange}
        />

        <Text style={styles.lockedHelperText}>
          Changes to artist name will update every performance in this artist group.
        </Text>

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
            <View key={row.id} style={styles.performanceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Performance {index + 1}</Text>

                {rows.length > 1 ? (
                  <TouchableOpacity
                    onPress={() => removePerformanceRow(row.id)}
                    disabled={isSaving}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <FormField
                label="Show Name *"
                value={row.showName}
                onChangeText={(value) => updateRow(row.id, { showName: value })}
              />

              <SearchablePickerField
                label="Venue"
                selectedLabel={[row.venue, row.city]
                  .filter((value) => value.trim().length > 0)
                  .join(' • ')}
                placeholder="Choose or add a venue"
                options={venuePickerOptions}
                onSelect={(option) => {
                  const selected = venueOptions.find((item) => item.id === option.id);
                  if (!selected) return;

                  updateRow(row.id, {
                    venue: selected.venueName,
                    city: selected.city,
                  });
                }}
                onClear={() => updateRow(row.id, { venue: '', city: '' })}
                onAddNew={(searchText) => {
                  const trimmed = searchText.trim();

                  if (!trimmed) {
                    setActiveRowIdForVenue(row.id);
                    setPendingVenueSearchText('');
                    setIsAddVenueModalVisible(true);
                    return;
                  }

                  const existing = findExistingVenueOption(
                    venuePickerOptions,
                    trimmed
                  );

                  if (existing) {
                    Alert.alert('Using existing option');

                    updateRow(row.id, {
                      venue: existing.title,
                      city: existing.subtitle ?? '',
                    });

                    return;
                  }

                  setActiveRowIdForVenue(row.id);
                  setPendingVenueSearchText(trimmed);
                  setIsAddVenueModalVisible(true);
                }}
              />

              <PickerField
                label="Date *"
                value={formatStoredDate(row.date)}
                placeholder="Select date"
                onPress={() =>
                  updateRow(row.id, {
                    draftDate: row.date,
                    showDatePicker: true,
                  })
                }
              />

              <TopSheetModal
                visible={row.showDatePicker}
                title="Select date"
                onClose={() =>
                  updateRow(row.id, {
                    draftDate: row.date,
                    showDatePicker: false,
                  })
                }
                onConfirm={() =>
                  updateRow(row.id, {
                    date: row.draftDate,
                    showDatePicker: false,
                  })
                }
              >
                <DateTimePicker
                  value={row.draftDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  themeVariant="dark"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      updateRow(row.id, { draftDate: selectedDate });
                    }
                  }}
                />
              </TopSheetModal>

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
                  const selected = genreOptions.find((item) => item.id === option.id);
                  if (!selected) return;

                  updateRow(row.id, {
                    genre: selected.name,
                    selectedGenreId: selected.id,
                    subGenre: '',
                  });
                }}
                onClear={() =>
                  updateRow(row.id, {
                    genre: '',
                    selectedGenreId: null,
                    subGenre: '',
                  })
                }
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
                  row.selectedGenreId
                    ? 'Choose or add a sub-genre'
                    : 'Select a genre first'
                }
                options={subGenrePickerOptions}
                disabled={!row.selectedGenreId}
                onSelect={(option) => {
                  const selected = availableSubGenreOptions.find(
                    (item) => item.id === option.id
                  );
                  if (!selected) return;

                  updateRow(row.id, { subGenre: selected.name });
                }}
                onClear={() => updateRow(row.id, { subGenre: '' })}
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
          onPress={addPerformanceRow}
          disabled={isSaving}
        >
          <Text style={styles.secondaryButtonText}>Add Performance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving
              ? isEditMode
                ? 'Saving Artist...'
                : 'Adding Artist...'
              : isEditMode
              ? 'Save Changes'
              : 'Add Artist'}
          </Text>
        </TouchableOpacity>

        {isEditMode ? (
          <TouchableOpacity
            style={[styles.deleteButton, isSaving && styles.disabledButton]}
            onPress={handleDelete}
            disabled={isSaving}
          >
            <Text style={styles.deleteButtonText}>Delete Artist</Text>
          </TouchableOpacity>
        ) : null}
      </AppScrollView>

      <AddVenueModal
        visible={isAddVenueModalVisible}
        initialVenueName={pendingVenueSearchText}
        onClose={() => {
          setIsAddVenueModalVisible(false);
          setActiveRowIdForVenue(null);
        }}
        onSave={async (newVenueName, newCity) => {
          const existing = findExistingVenueOption(
            venuePickerOptions,
            newVenueName,
            newCity
          );

          if (existing) {
            Alert.alert('Using existing option');

            if (activeRowIdForVenue) {
              updateRow(activeRowIdForVenue, {
                venue: existing.title,
                city: existing.subtitle ?? '',
              });
            }

            setIsAddVenueModalVisible(false);
            setActiveRowIdForVenue(null);
            return;
          }
          try {
            const added = await addVenueOption(newVenueName, newCity);

            if (activeRowIdForVenue) {
              updateRow(activeRowIdForVenue, {
                venue: added.venueName,
                city: added.city,
              });
            }

            setIsAddVenueModalVisible(false);
            setActiveRowIdForVenue(null);
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
  performanceCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  removeText: {
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