import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageSubGenresScreen from '../../features/catalog/screens/ManageSubGenresScreen';

const mockAddSubGenreOption = jest.fn();
const mockDeleteSubGenreOption = jest.fn();
const mockIsSubGenreOptionInUse = jest.fn();
const mockGetSubGenreOptionsByGenreId = jest.fn();

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

jest.mock('../../features/catalog/components/CatalogRow', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockCatalogRow({
    title,
    onDelete,
    disabledReason,
  }: {
    title: string;
    onDelete: () => void;
    disabledReason?: string;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, title),
      disabledReason ? React.createElement(Text, null, disabledReason) : null,
      React.createElement(
        Pressable,
        { onPress: onDelete },
        React.createElement(Text, null, `Remove ${title}`)
      )
    );
  };
});

jest.mock('../../features/genres/components/AddSubGenreModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddSubGenreModal({
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
        { onPress: () => onSave('Indie Pop') },
        React.createElement(Text, null, 'Confirm Add SubGenre')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Close SubGenre Modal')
      )
    );
  };
});

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    getSubGenreOptionsByGenreId: mockGetSubGenreOptionsByGenreId,
    addSubGenreOption: mockAddSubGenreOption,
    deleteSubGenreOption: mockDeleteSubGenreOption,
    isSubGenreOptionInUse: mockIsSubGenreOptionInUse,
  }),
}));

describe('ManageSubGenresScreen', () => {
  function confirmRemoveAlert() {
    alertSpy.mockImplementation((title, message, buttons) => {
      buttons?.find((button) => button.text === 'Remove')?.onPress?.();
    });
  }
  const alertSpy = jest.spyOn(Alert, 'alert');
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSubGenreOptionInUse.mockReturnValue(false);
    mockGetSubGenreOptionsByGenreId.mockReturnValue([
      {
        id: 'indie-pop',
        genreId: 'indie',
        name: 'Indie Pop',
        normalizedKey: 'indie-indie-pop',
      },
    ]);
  });

  it('renders sub-genres for the selected genre', () => {
    const screen = render(
      <ManageSubGenresScreen
        route={{
          key: '1',
          name: 'ManageSubGenres',
          params: { genreId: 'indie', genreName: 'Indie' },
        } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Indie Pop')).toBeTruthy();
  });

  it('deletes an unused sub-genre', async () => {
    confirmRemoveAlert();

    const screen = render(
      <ManageSubGenresScreen
        route={{
          key: '1',
          name: 'ManageSubGenres',
          params: { genreId: 'indie', genreName: 'Indie' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Indie Pop'));

    await waitFor(() => {
      expect(mockDeleteSubGenreOption).toHaveBeenCalledWith('indie-pop');
    });
  });

  it('blocks deleting a used sub-genre', () => {
    mockIsSubGenreOptionInUse.mockReturnValue(true);

    const screen = render(
      <ManageSubGenresScreen
        route={{
          key: '1',
          name: 'ManageSubGenres',
          params: { genreId: 'indie', genreName: 'Indie' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Indie Pop'));

    expect(mockDeleteSubGenreOption).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Sub-genre is in use',
      'Open the usage list to replace or remove this sub-genre from performances first.'
    );
  });

  it('adds a new sub-genre', async () => {
    const screen = render(
      <ManageSubGenresScreen
        route={{
          key: '1',
          name: 'ManageSubGenres',
          params: { genreId: 'indie', genreName: 'Indie' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add SubGenre'));

    await waitFor(() => {
      expect(mockAddSubGenreOption).toHaveBeenCalledWith(
        'indie',
        'Indie',
        'Indie Pop'
      );
    });
  });

  it('shows error when addSubGenreOption fails', async () => {
    mockAddSubGenreOption.mockRejectedValueOnce(
      new Error('Add sub-genre failed')
    );

    const screen = render(
      <ManageSubGenresScreen
        route={{
          key: '1',
          name: 'ManageSubGenres',
          params: { genreId: 'indie', genreName: 'Indie' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add SubGenre'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add sub-genre',
        'Add sub-genre failed'
      );
    });
  });
});