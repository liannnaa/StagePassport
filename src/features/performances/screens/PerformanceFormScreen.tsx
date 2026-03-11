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
import AppTextInput from '../../../components/AppTextInput';
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
import { findMatchingPerformanceByShowId } from '../../venues/utils/venueMatching';
import AddGenreModal from '../../genres/components/AddGenreModal';
import AddSubGenreModal from '../../genres/components/AddSubGenreModal';
import { findMatchingPerformanceByArtist } from '../../genres/utils/artistGenreMatching';
import AddTagModal from '../../tags/components/AddTagModal';

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
  updatePerformance,
  syncGenresForArtist,
  getPerformanceById,
  tagOptions,
  addTagOption,
} = usePerformances();

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
      tag: existingPerformance?.tag ?? '',
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

  const [genre, setGenre] = useState(initialValues.genre);
  const [subGenre, setSubGenre] = useState(initialValues.subGenre);
  const [showName, setShowName] = useState(initialValues.showName);

  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tag, setTag] = useState(initialValues.tag);
  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [pendingTagSearchText, setPendingTagSearchText] = useState('');

  const [isVenueLocked, setIsVenueLocked] = useState(false);
  const [isAddVenueModalVisible, setIsAddVenueModalVisible] = useState(false);
  const [pendingVenueSearchText, setPendingVenueSearchText] = useState('');

  const [isAddGenreModalVisible, setIsAddGenreModalVisible] = useState(false);
  const [pendingGenreSearchText, setPendingGenreSearchText] = useState('');

  const [isAddSubGenreModalVisible, setIsAddSubGenreModalVisible] = useState(false);
  const [pendingSubGenreSearchText, setPendingSubGenreSearchText] = useState('');

  const formattedDate = formatStoredDate(date);
  const derivedShowId = buildShowId(showName, formattedDate);

  useEffect(() => {
    if (!showName.trim()) {
      setIsVenueLocked(false);
      return;
    }

    const matched = findMatchingPerformanceByShowId(
      performances,
      existingPerformance?.id,
      derivedShowId
    );

    if (matched) {
      setVenue(matched.venue);
      setCity(matched.city);
      setIsVenueLocked(true);
      return;
    }

    setIsVenueLocked(false);
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

    if (!subGenre.trim()) {
      return;
    }

    const subGenreOptions = getSubGenreOptionsByGenreId(matchedGenre.id);
    const subGenreStillValid = subGenreOptions.some(
      (option) => option.name.toLowerCase() === subGenre.trim().toLowerCase()
    );

    if (!subGenreStillValid) {
      setSubGenre('');
    }
  }, [genre, subGenre, genreOptions, getSubGenreOptionsByGenreId]);

  useEffect(() => {
    if (!artist.trim()) {
      return;
    }

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

  const availableSubGenreOptions = useMemo(() => {
    if (!selectedGenreId) return [];
    return getSubGenreOptionsByGenreId(selectedGenreId);
  }, [selectedGenreId, getSubGenreOptionsByGenreId]);

  const subGenrePickerOptions = useMemo<PickerOption[]>(() => {
    return availableSubGenreOptions.map((option) => ({
      id: option.id,
      title: option.name,
    }));
  }, [availableSubGenreOptions]);

  async function handleSave() {
    if (!artist.trim() || !showName.trim()) {
      Alert.alert(
        'Missing required fields',
        'Artist and show name are required.'
      );
      return;
    }

    const payload = {
      artist: artist.trim(),
      venue: venue.trim(),
      city: city.trim(),
      date: formattedDate,
      tag: tag.trim(),
      genre: genre.trim(),
      subGenre: subGenre.trim(),
      showName: showName.trim(),
    };

    try {
      if (isEditMode && existingPerformance) {
        await updatePerformance(existingPerformance.id, payload);
      } else {
        await addPerformance(payload);
      }

      await syncGenresForArtist(
        artist.trim(),
        genre.trim(),
        subGenre.trim()
      );

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Save failed', message);
    }
  }

  return (
    <ScreenContainer
      showHeader
      title={isEditMode ? 'Edit Performance' : 'Add Performance'}
      subtitle={
        isEditMode
          ? 'Update performance details'
          : 'Create a new performance'
      }
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Catalog"
      onRightActionPress={() => navigation.navigate('ManageCatalog')}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        <FormField label="Artist *" value={artist} onChangeText={setArtist} />
        <FormField
          label="Show Name *"
          value={showName}
          onChangeText={setShowName}
        />

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
              if (selectedDate) {
                setDraftDate(selectedDate);
              }
            }}
          />
        </TopSheetModal>

        <SearchablePickerField
          label="Tag"
          selectedLabel={tag}
          placeholder="Choose or add a tag"
          options={tagPickerOptions}
          onSelect={(option) => {
            const selected = tagOptions.find((item) => item.id === option.id);
            if (!selected) return;

            setTag(selected.name);
          }}
          onClear={() => {
            setTag('');
          }}
          onAddNew={(searchText) => {
            setPendingTagSearchText(searchText);
            setIsAddTagModalVisible(true);
          }}
          addNewLabel="Add tag"
        />

        <SearchablePickerField
          label="Venue"
          selectedLabel={[venue, city]
            .filter((v) => v.trim().length > 0)
            .join(' • ')}
          placeholder="Choose or add a venue"
          options={venuePickerOptions}
          disabled={isVenueLocked}
          onSelect={(option) => {
            const selected = venueOptions.find((v) => v.id === option.id);
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

        {isVenueLocked ? (
          <Text style={styles.lockedHelperText}>
            Venue is locked because another performance already uses this show ID.
          </Text>
        ) : null}

        <SearchablePickerField
          label="Genre"
          selectedLabel={genre}
          placeholder="Choose or add a genre"
          options={genrePickerOptions}
          onSelect={(option) => {
            const selected = genreOptions.find((g) => g.id === option.id);
            if (!selected) return;

            setGenre(selected.name);
            setSelectedGenreId(selected.id);
            setSubGenre('');
          }}
          onClear={() => {
            setGenre('');
            setSubGenre('');
            setSelectedGenreId(null);
          }}
          onAddNew={(searchText) => {
            setPendingGenreSearchText(searchText);
            setIsAddGenreModalVisible(true);
          }}
        />

        <SearchablePickerField
          label="Sub-Genre"
          selectedLabel={subGenre}
          placeholder={
            selectedGenreId
              ? 'Choose or add a sub-genre'
              : 'Select a genre first'
          }
          options={subGenrePickerOptions}
          disabled={!selectedGenreId}
          onSelect={(option) => {
            const selected = availableSubGenreOptions.find(
              (s) => s.id === option.id
            );
            if (!selected) return;

            setSubGenre(selected.name);
          }}
          onClear={() => {
            setSubGenre('');
          }}
          onAddNew={(searchText) => {
            if (!selectedGenreId) return;

            setPendingSubGenreSearchText(searchText);
            setIsAddSubGenreModalVisible(true);
          }}
        />

        {artist.trim() ? (
          <Text style={styles.lockedHelperText}>
            Saving will update genre and sub-genre for all performances by this artist.
          </Text>
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Save Changes' : 'Add Performance'}
          </Text>
        </TouchableOpacity>
      </AppScrollView>

      <AddTagModal
        visible={isAddTagModalVisible}
        initialTagName={pendingTagSearchText}
        onClose={() => setIsAddTagModalVisible(false)}
        onSave={async (newTagName) => {
          try {
            const added = await addTagOption(newTagName);
            setTag(added.name);
            setIsAddTagModalVisible(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add tag', message);
          }
        }}
      />

      <AddVenueModal
        visible={isAddVenueModalVisible}
        initialVenueName={pendingVenueSearchText}
        onClose={() => setIsAddVenueModalVisible(false)}
        onSave={async (newVenueName, newCity) => {
          try {
            const added = await addVenueOption(newVenueName, newCity);
            setVenue(added.venueName);
            setCity(added.city);
            setIsAddVenueModalVisible(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add venue', message);
          }
        }}
      />

      <AddGenreModal
        visible={isAddGenreModalVisible}
        initialGenreName={pendingGenreSearchText}
        onClose={() => setIsAddGenreModalVisible(false)}
        onSave={async (newGenreName) => {
          try {
            const added = await addGenreOption(newGenreName);
            setGenre(added.name);
            setSelectedGenreId(added.id);
            setSubGenre('');
            setIsAddGenreModalVisible(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add genre', message);
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

          try {
            const added = await addSubGenreOption(
              selectedGenreId,
              genre,
              newSubGenreName
            );

            setSubGenre(added.name);
            setIsAddSubGenreModalVisible(false);
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

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

function FormField({ label, value, onChangeText }: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  readOnlyBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.textSecondary,
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
});