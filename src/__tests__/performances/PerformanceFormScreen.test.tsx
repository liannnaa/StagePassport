import React from 'react';
import { Alert, TextInput } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PerformanceFormScreen from '../../features/performances/screens/PerformanceFormScreen';
import { Performance } from '../../features/performances/types/performance';
import { SubGenreOption } from '../../features/genres/types/genre';

const mockAddPerformance = jest.fn();
const mockUpdatePerformance = jest.fn();
const mockSyncGenresForArtist = jest.fn();
const mockAddVenueOption = jest.fn();
const mockAddGenreOption = jest.fn();
const mockAddSubGenreOption = jest.fn();
const mockAddTagOption = jest.fn();
const mockGetPerformanceById = jest.fn();
const mockGetSubGenreOptionsByGenreId = jest.fn(
  (): SubGenreOption[] => []
);

const mockFindMatchingPerformanceByShowId = jest.fn<
  Performance | undefined,
  [Performance[], string | undefined, string]
>();

const mockFindMatchingPerformanceByArtist = jest.fn<
  Performance | undefined,
  [Performance[], string | undefined, string]
>();

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

async function renderScreen(
  params: any = { mode: 'add' }
) {
  const screen = render(
    <PerformanceFormScreen
      route={{ key: '1', name: 'PerformanceForm', params } as any}
      navigation={navigation as any}
    />
  );

  await waitFor(() => {
    expect(screen.UNSAFE_getAllByType(TextInput).length).toBeGreaterThan(0);
  });

  return screen;
}

const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('not wrapped in act')
    ) {
      return;
    }
    originalError(...args);
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockDateTimePicker({
    onChange,
  }: {
    onChange?: (event: unknown, date?: Date) => void;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Pressable,
        {
          onPress: () => onChange?.({}, new Date('2026-05-01T00:00:00.000Z')),
        },
        React.createElement(Text, null, 'Pick New Date')
      ),
      React.createElement(
        Pressable,
        {
          onPress: () => onChange?.({}, undefined),
        },
        React.createElement(Text, null, 'Pick No Date')
      )
    );
  };
});

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockScreenContainer({
    children,
    showBackButton,
    onBackPress,
    rightActionLabel,
    onRightActionPress,
  }: {
    children: React.ReactNode;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightActionLabel?: string;
    onRightActionPress?: () => void;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      showBackButton
        ? React.createElement(
            Pressable,
            { onPress: onBackPress },
            React.createElement(Text, null, 'Back')
          )
        : null,
      rightActionLabel
        ? React.createElement(
            Pressable,
            { onPress: onRightActionPress },
            React.createElement(Text, null, rightActionLabel)
          )
        : null,
      children
    );
  };
});

jest.mock('../../components/AppScrollView', () => {
  const React = require('react');
  return function MockAppScrollView({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('../../components/TopSheetModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockTopSheetModal({
    visible,
    children,
    onClose,
    onConfirm,
  }: {
    visible: boolean;
    children: React.ReactNode;
    onClose?: () => void;
    onConfirm?: () => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      React.Fragment,
      null,
      children,
      onClose
        ? React.createElement(
            Pressable,
            { onPress: onClose },
            React.createElement(Text, null, 'Cancel Date Picker')
          )
        : null,
      onConfirm
        ? React.createElement(
            Pressable,
            { onPress: onConfirm },
            React.createElement(Text, null, 'Confirm Date Picker')
          )
        : null
    );
  };
});

jest.mock('../../components/PickerField', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockPickerField({
    label,
    value,
    placeholder,
  }: {
    label: string;
    value?: string;
    placeholder?: string;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, label),
      React.createElement(Text, null, value || placeholder || '')
    );
  };
});

jest.mock('../../features/catalog/components/SearchablePickerField', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockSearchablePickerField({
    label,
    selectedLabel,
    placeholder,
    options,
    onSelect,
    onClear,
    onAddNew,
  }: {
    label: string;
    selectedLabel?: string;
    placeholder?: string;
    options?: Array<{ id: string; title: string }>;
    onSelect?: (option: { id: string; title: string }) => void;
    onClear?: () => void;
    onAddNew?: (searchText: string) => void;
  }) {
    const firstOption = options?.[0];

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, label),
      React.createElement(Text, null, selectedLabel || placeholder || ''),
      firstOption && onSelect
        ? React.createElement(
            Pressable,
            { onPress: () => onSelect(firstOption) },
            React.createElement(Text, null, `Select ${label}`)
          )
        : null,
      onClear
        ? React.createElement(
            Pressable,
            { onPress: onClear },
            React.createElement(Text, null, `Clear ${label}`)
          )
        : null,
      onAddNew
        ? React.createElement(
            Pressable,
            { onPress: () => onAddNew(`${label} draft`) },
            React.createElement(Text, null, `Add ${label}`)
          )
        : null
    );
  };
});

jest.mock('../../features/venues/components/AddVenueModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddVenueModal({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (venueName: string, city: string) => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      Pressable,
      { onPress: () => onSave('Fox Theatre', 'Atlanta') },
      React.createElement(Text, null, 'Confirm Add Venue Modal')
    );
  };
});

jest.mock('../../features/genres/components/AddGenreModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddGenreModal({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (name: string) => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      Pressable,
      { onPress: () => onSave('Indie') },
      React.createElement(Text, null, 'Confirm Add Genre Modal')
    );
  };
});

jest.mock('../../features/genres/components/AddSubGenreModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddSubGenreModal({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (name: string) => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      Pressable,
      { onPress: () => onSave('Indie Pop') },
      React.createElement(Text, null, 'Confirm Add SubGenre Modal')
    );
  };
});

jest.mock('../../features/tags/components/AddTagModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddTagModal({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (name: string) => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      Pressable,
      { onPress: () => onSave('Headliner') },
      React.createElement(Text, null, 'Confirm Add Tag Modal')
    );
  };
});

jest.mock('../../features/venues/utils/venueMatching', () => ({
  findMatchingPerformanceByShowId: (
    performances: Performance[],
    currentPerformanceId: string | undefined,
    showId: string
  ) =>
    mockFindMatchingPerformanceByShowId(
      performances,
      currentPerformanceId,
      showId
    ),
}));

jest.mock('../../features/genres/utils/artistGenreMatching', () => ({
  findMatchingPerformanceByArtist: (
    performances: Performance[],
    currentPerformanceId: string | undefined,
    artist: string
  ) =>
    mockFindMatchingPerformanceByArtist(
      performances,
      currentPerformanceId,
      artist
    ),
}));

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    performances: [],
    venueOptions: [
      {
        id: 'fox-theatre-atlanta',
        venueName: 'Fox Theatre',
        city: 'Atlanta',
        normalizedKey: 'fox-theatre-atlanta',
      },
    ],
    genreOptions: [{ id: 'indie', name: 'Indie', normalizedName: 'indie' }],
    tagOptions: [{ id: 'headliner', name: 'Headliner' }],
    addVenueOption: mockAddVenueOption,
    addGenreOption: mockAddGenreOption,
    getSubGenreOptionsByGenreId: mockGetSubGenreOptionsByGenreId,
    addSubGenreOption: mockAddSubGenreOption,
    addPerformance: mockAddPerformance,
    updatePerformance: mockUpdatePerformance,
    syncGenresForArtist: mockSyncGenresForArtist,
    getPerformanceById: mockGetPerformanceById,
    addTagOption: mockAddTagOption,
  }),
}));

describe('PerformanceFormScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPerformanceById.mockReturnValue(undefined);
    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      {
        id: 'indie|indie pop',
        genreId: 'indie',
        name: 'Indie Pop',
        normalizedKey: 'indie|indie pop',
      },
    ]);
    mockFindMatchingPerformanceByShowId.mockReturnValue(undefined);
    mockFindMatchingPerformanceByArtist.mockReturnValue(undefined);
  });

  function getInputs(screen: ReturnType<typeof render>) {
    return screen.UNSAFE_getAllByType(TextInput);
  }

  it('lets a user add a performance with required fields only', async () => {
    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    fireEvent.press(screen.getByText('Add Performance'));

    await waitFor(() => {
      expect(mockAddPerformance).toHaveBeenCalledWith(
        expect.objectContaining({
          artist: 'Faye Webster',
          showName: 'Atlanta Show',
          venue: '',
          city: '',
          tag: '',
          genre: '',
          subGenre: '',
        })
      );
    });

    expect(mockSyncGenresForArtist).toHaveBeenCalledWith(
      'Faye Webster',
      '',
      ''
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('blocks save when required fields are missing', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Performance'));

    await waitFor(() => {
      expect(mockAddPerformance).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        'Missing required fields',
        'Artist and show name are required.'
      );
    });
  });

  it('loads existing values in edit mode', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '04-21-26',
      tag: 'Headliner',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      {
        id: 'indie|indie pop',
        genreId: 'indie',
        name: 'Indie Pop',
        normalizedKey: 'indie|indie pop'
      }
    ]);

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    const inputs = getInputs(screen);

    expect(inputs[0].props.value).toBe('Faye Webster');
    expect(inputs[1].props.value).toBe('Atlanta Show');
    expect(screen.getByText('Headliner')).toBeTruthy();
    expect(screen.getByText('Fox Theatre • Atlanta')).toBeTruthy();
    expect(screen.getByText('Indie')).toBeTruthy();
    expect(screen.getByText('Indie Pop')).toBeTruthy();
  });

  it('updates an existing performance in edit mode', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: '',
      showId: 'old-name-04-21-26',
      showName: 'Old Name',
    });

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[1], 'New Name');

    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdatePerformance).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({
          artist: 'Faye Webster',
          showName: 'New Name',
        })
      );
    });

    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('shows locked venue helper text when a matching show id exists', async () => {
    mockFindMatchingPerformanceByShowId.mockReturnValue({
      id: 'existing-1',
      artist: 'Faye Webster',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: '',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    await waitFor(() => {
      expect(
        screen.getByText(
          'Venue is locked because another performance already uses this show ID.'
        )
      ).toBeTruthy();
      expect(screen.getByText('Fox Theatre • Atlanta')).toBeTruthy();
    });
  });

  it('prefills genre and sub-genre when a matching artist exists', async () => {
    mockFindMatchingPerformanceByArtist.mockReturnValue({
      id: 'existing-artist-1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-20-26',
      tag: '',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'older-show-04-20-26',
      showName: 'Older Show',
    });

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');

    await waitFor(() => {
      expect(screen.getByText('Indie')).toBeTruthy();
      expect(screen.getByText('Indie Pop')).toBeTruthy();
    });
  });

  it('clears sub-genre when current sub-genre is no longer valid for the selected genre', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      { id: 'dream-pop', genreId: 'indie', name: 'Dream Pop', normalizedKey: 'dream-pop' },
    ]);

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    expect(screen.queryByText('Indie Pop')).toBeNull();
    expect(screen.getByText('Choose or add a sub-genre')).toBeTruthy();
  });

  it('clears genre and sub-genre when genre is cleared', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Clear Genre'));

    await waitFor(() => {
      expect(screen.getByText('Choose or add a genre')).toBeTruthy();
      expect(screen.getByText('Select a genre first')).toBeTruthy();
    });
  });

  it('adds a tag from the tag modal flow', async () => {
    mockAddTagOption.mockReturnValue({
      id: 'headliner',
      name: 'Headliner',
      normalizedName: 'headliner',
    });

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Tag'));
    fireEvent.press(screen.getByText('Confirm Add Tag Modal'));

    await waitFor(() => {
      expect(mockAddTagOption).toHaveBeenCalledWith('Headliner');
    });

    expect(screen.getByText('Headliner')).toBeTruthy();
  });

  it('adds a venue from the venue modal flow', async () => {
    mockAddVenueOption.mockReturnValue({
      id: 'fox-theatre-atlanta',
      venueName: 'Fox Theatre',
      city: 'Atlanta',
      normalizedKey: 'fox-theatre::atlanta',
    });

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Venue'));
    fireEvent.press(screen.getByText('Confirm Add Venue Modal'));

    await waitFor(() => {
      expect(mockAddVenueOption).toHaveBeenCalledWith('Fox Theatre', 'Atlanta');
    });

    expect(screen.getByText('Fox Theatre • Atlanta')).toBeTruthy();
  });

  it('adds a genre from the genre modal flow', async () => {
    mockAddGenreOption.mockReturnValue({
      id: 'indie',
      name: 'Indie',
      normalizedName: 'indie',
    });

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Genre'));
    fireEvent.press(screen.getByText('Confirm Add Genre Modal'));

    await waitFor(() => {
      expect(mockAddGenreOption).toHaveBeenCalledWith('Indie');
    });

    expect(screen.getByText('Indie')).toBeTruthy();
  });

  it('adds a sub-genre from the sub-genre modal flow', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: '',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockAddSubGenreOption.mockReturnValue({
      id: 'indie::indie pop',
      genreId: 'indie',
      name: 'Indie Pop',
      normalizedKey: 'indie::indie pop',
    });

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Add Sub-Genre'));
    fireEvent.press(screen.getByText('Confirm Add SubGenre Modal'));

    await waitFor(() => {
      expect(mockAddSubGenreOption).toHaveBeenCalledWith(
        'indie',
        'Indie',
        'Indie Pop'
      );
    });

    expect(screen.getByText('Indie Pop')).toBeTruthy();
  });

  it('shows save failed alert when addPerformance rejects', async () => {
    mockAddPerformance.mockRejectedValueOnce(new Error('Network failed'));

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    fireEvent.press(screen.getByText('Add Performance'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Save failed', 'Network failed');
    });
  });

  it('shows save failed alert when updatePerformance rejects in edit mode', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: '',
      showId: 'old-name-04-21-26',
      showName: 'Old Name',
    });

    mockUpdatePerformance.mockRejectedValueOnce(new Error('Update failed'));

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Save failed', 'Update failed');
    });
  });

  it('locks venue when a matching show exists even if venue and city are blank', async () => {
    mockFindMatchingPerformanceByShowId.mockReturnValue({
      id: 'existing-1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: '',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    await waitFor(() => {
      expect(
        screen.getByText(
          'Venue is locked because another performance already uses this show ID.'
        )
      ).toBeTruthy();
      expect(screen.getByText('Choose or add a venue')).toBeTruthy();
    });
  });

  it('keeps venue unlocked when show name is blank', async () => {
    const screen = await renderScreen({ mode: 'add' });

    expect(
      screen.queryByText(
        'Venue is locked because another performance already uses this show ID.'
      )
    ).toBeNull();
  });

  it('does not prefill genre when matching artist has no genre', async () => {
    mockFindMatchingPerformanceByArtist.mockReturnValue({
      id: 'existing-artist-1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-20-26',
      tag: '',
      genre: '',
      subGenre: '',
      showId: 'older-show-04-20-26',
      showName: 'Older Show',
    });

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');

    await waitFor(() => {
      expect(screen.getByText('Choose or add a genre')).toBeTruthy();
      expect(screen.getByText('Select a genre first')).toBeTruthy();
    });
  });

  it('does not add a sub-genre when genre is blank during save', async () => {
    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    fireEvent.press(screen.getByText('Add Performance'));

    await waitFor(() => {
      expect(mockAddPerformance).toHaveBeenCalled();
    });

    expect(mockAddSubGenreOption).not.toHaveBeenCalled();
  });

  it('does not sync genres when artist is blank', async () => {
    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    fireEvent.press(screen.getByText('Add Performance'));

    expect(mockSyncGenresForArtist).not.toHaveBeenCalled();
  });

  it('shows generic save failed message for non-Error rejection', async () => {
    mockAddPerformance.mockRejectedValueOnce('bad failure');

    const screen = await renderScreen({ mode: 'add' });

    const inputs = getInputs(screen);
    fireEvent.changeText(inputs[0], 'Faye Webster');
    fireEvent.changeText(inputs[1], 'Atlanta Show');

    fireEvent.press(screen.getByText('Add Performance'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Save failed',
        'Something went wrong.'
      );
    });
  });

  it('cancels the date picker and keeps the original date', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('04-21-26'));
    fireEvent.press(screen.getByText('Pick New Date'));
    fireEvent.press(screen.getByText('Cancel Date Picker'));

    await waitFor(() => {
      expect(screen.getByText('04-21-26')).toBeTruthy();
    });
  });

  it('ignores date picker onChange when no date is selected', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('04-21-26'));
    fireEvent.press(screen.getByText('Pick No Date'));
    fireEvent.press(screen.getByText('Confirm Date Picker'));

    await waitFor(() => {
      expect(screen.getByText('04-21-26')).toBeTruthy();
    });
  });

  it('goes back when the back button is pressed', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Back'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('navigates to the catalog screen when Catalog is pressed', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Catalog'));
    expect(navigation.navigate).toHaveBeenCalledWith('ManageCatalog');
  });

  it('selects an existing tag from the picker', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Select Tag'));

    await waitFor(() => {
      expect(screen.getByText('Headliner')).toBeTruthy();
    });
  });

  it('clears the selected tag', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Select Tag'));

    await waitFor(() => {
      expect(screen.getByText('Headliner')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Clear Tag'));

    await waitFor(() => {
      expect(screen.getByText('Choose or add a tag')).toBeTruthy();
    });
  });

  it('selects an existing venue from the picker', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Select Venue'));

    await waitFor(() => {
      expect(screen.getByText('Fox Theatre • Atlanta')).toBeTruthy();
    });
  });

  it('clears the selected venue', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Select Venue'));

    await waitFor(() => {
      expect(screen.getByText('Fox Theatre • Atlanta')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Clear Venue'));

    await waitFor(() => {
      expect(screen.getByText('Choose or add a venue')).toBeTruthy();
    });
  });

  it('selects an existing genre from the picker and resets sub-genre', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Select Genre'));

    await waitFor(() => {
      expect(screen.getByText('Indie')).toBeTruthy();
      expect(screen.getByText('Choose or add a sub-genre')).toBeTruthy();
    });
  });

  it('selects an existing sub-genre from the picker', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: '',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      {
        id: 'indie|indie pop',
        genreId: 'indie',
        name: 'Indie Pop',
        normalizedKey: 'indie|indie pop',
      },
    ]);

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Select Sub-Genre'));

    await waitFor(() => {
      expect(screen.getByText('Indie Pop')).toBeTruthy();
    });
  });

  it('clears the selected sub-genre', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      {
        id: 'indie|indie pop',
        genreId: 'indie',
        name: 'Indie Pop',
        normalizedKey: 'indie|indie pop',
      },
    ]);

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Clear Sub-Genre'));

    await waitFor(() => {
      expect(screen.getByText('Choose or add a sub-genre')).toBeTruthy();
    });
  });

  it('clears selectedGenreId and subGenre when genre does not match a known option', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Unknown Genre',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    await waitFor(() => {
      expect(screen.getByText('Unknown Genre')).toBeTruthy();
      expect(screen.getByText('Select a genre first')).toBeTruthy();
    });
  });

  it('shows generic error when addTagOption rejects with a non-Error', async () => {
    mockAddTagOption.mockRejectedValueOnce('bad tag failure');

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Tag'));
    fireEvent.press(screen.getByText('Confirm Add Tag Modal'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add tag',
        'Something went wrong.'
      );
    });
  });

  it('shows generic error when addVenueOption rejects with a non-Error', async () => {
    mockAddVenueOption.mockRejectedValueOnce('bad venue failure');

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Venue'));
    fireEvent.press(screen.getByText('Confirm Add Venue Modal'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add venue',
        'Something went wrong.'
      );
    });
  });

  it('shows generic error when addGenreOption rejects with a non-Error', async () => {
    mockAddGenreOption.mockRejectedValueOnce('bad genre failure');

    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Genre'));
    fireEvent.press(screen.getByText('Confirm Add Genre Modal'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add genre',
        'Something went wrong.'
      );
    });
  });

  it('shows generic error when addSubGenreOption rejects with a non-Error', async () => {
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: '',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    });

    mockAddSubGenreOption.mockRejectedValueOnce('bad sub-genre failure');

    const screen = await renderScreen({
      mode: 'edit',
      performanceId: 'p1',
    });

    fireEvent.press(screen.getByText('Add Sub-Genre'));
    fireEvent.press(screen.getByText('Confirm Add SubGenre Modal'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add sub-genre',
        'Something went wrong.'
      );
    });
  });

  it('does nothing when trying to add a sub-genre without a selected genre id', async () => {
    const screen = await renderScreen({ mode: 'add' });

    fireEvent.press(screen.getByText('Add Sub-Genre'));

    expect(screen.queryByText('Confirm Add SubGenre Modal')).toBeNull();
    expect(mockAddSubGenreOption).not.toHaveBeenCalled();
  });
});