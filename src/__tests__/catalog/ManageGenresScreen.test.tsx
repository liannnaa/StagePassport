import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageGenresScreen from '../../features/catalog/screens/ManageGenresScreen';

const mockAddGenreOption = jest.fn();
const mockDeleteGenreOption = jest.fn();
const mockIsGenreOptionInUse = jest.fn();

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockScreenContainer({
    children,
    leftActionLabel,
    onLeftActionPress,
    rightActionLabel,
    onRightActionPress,
  }: {
    children: React.ReactNode;
    leftActionLabel?: string;
    onLeftActionPress?: () => void;
    rightActionLabel?: string;
    onRightActionPress?: () => void;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      leftActionLabel
        ? React.createElement(
            Pressable,
            { onPress: onLeftActionPress },
            React.createElement(Text, null, leftActionLabel)
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

jest.mock('../../components/EmptyState', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockEmptyState({
    title,
    body,
  }: {
    title: string;
    body: string;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, body)
    );
  };
});

jest.mock('../../features/genres/components/AddGenreModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddGenreModal({
    visible,
    onSave,
    onClose,
  }: {
    visible: boolean;
    onSave: (name: string) => void | Promise<void>;
    onClose: () => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Pressable,
        { onPress: () => onSave('Indie') },
        React.createElement(Text, null, 'Confirm Add Genre')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Close Genre Modal')
      )
    );
  };
});

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    genreOptions: mockGenreOptions,
    addGenreOption: mockAddGenreOption,
    deleteGenreOption: mockDeleteGenreOption,
    isGenreOptionInUse: mockIsGenreOptionInUse,
  }),
}));

let mockGenreOptions = [
  {
    id: 'indie',
    name: 'Indie',
    normalizedName: 'indie',
  },
];

describe('ManageGenresScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsGenreOptionInUse.mockReturnValue(false);
    mockGenreOptions = [
      {
        id: 'indie',
        name: 'Indie',
        normalizedName: 'indie',
      },
    ];
  });

  it('renders existing genres', () => {
    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Indie')).toBeTruthy();
    expect(screen.getByText('Tap to manage sub-genres')).toBeTruthy();
  });

  it('navigates to the sub-genres screen when a genre is pressed', () => {
    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Indie'));

    expect(navigation.navigate).toHaveBeenCalledWith('ManageSubGenres', {
      genreId: 'indie',
      genreName: 'Indie',
    });
  });

  it('deletes an unused genre', async () => {
    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove'));

    await waitFor(() => {
      expect(mockDeleteGenreOption).toHaveBeenCalledWith('indie');
    });
  });

  it('shows used-state UI and prevents deleting a used genre', () => {
    mockIsGenreOptionInUse.mockReturnValue(true);

    const screen = render(
        <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
        />
    );

    expect(screen.getByText('Used by existing performances')).toBeTruthy();

    fireEvent.press(screen.getByText('Remove'));

    expect(mockDeleteGenreOption).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    });

  it('adds a new genre', async () => {
    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Genre'));

    await waitFor(() => {
      expect(mockAddGenreOption).toHaveBeenCalledWith('Indie');
    });
  });

  it('shows error when addGenreOption fails', async () => {
    mockAddGenreOption.mockRejectedValueOnce(new Error('Add genre failed'));

    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Genre'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add genre',
        'Add genre failed'
      );
    });
  });

  it('shows empty state when there are no genres', () => {
    mockGenreOptions = [];

    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('No genres yet')).toBeTruthy();
    expect(screen.getByText('Add a genre to build your catalog.')).toBeTruthy();
  });

  it('closes the add genre modal without saving', () => {
    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    expect(screen.getByText('Confirm Add Genre')).toBeTruthy();

    fireEvent.press(screen.getByText('Close Genre Modal'));

    expect(screen.queryByText('Confirm Add Genre')).toBeNull();
  });

  it('shows error when deleteGenreOption fails', async () => {
    mockDeleteGenreOption.mockRejectedValueOnce(new Error('Delete genre failed'));

    const screen = render(
      <ManageGenresScreen
        route={{ key: '1', name: 'ManageGenres' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to remove genre',
        'Delete genre failed'
      );
    });
  });
});