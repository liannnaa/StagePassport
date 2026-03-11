import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageTagsScreen from '../../features/catalog/screens/ManageTagsScreen';

const mockAddTagOption = jest.fn();
const mockDeleteTagOption = jest.fn();
const mockIsTagOptionInUse = jest.fn();

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
      disabledReason
        ? React.createElement(Text, null, disabledReason)
        : null,
      React.createElement(
        Pressable,
        { onPress: onDelete },
        React.createElement(Text, null, `Remove ${title}`)
      )
    );
  };
});

jest.mock('../../features/tags/components/AddTagModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddTagModal({
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
        { onPress: () => onSave('Festival') },
        React.createElement(Text, null, 'Confirm Add Tag')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Close Tag Modal')
      )
    );
  };
});

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    tagOptions: [
      { id: 'headliner', name: 'Headliner', normalizedName: 'headliner' },
    ],
    addTagOption: mockAddTagOption,
    deleteTagOption: mockDeleteTagOption,
    isTagOptionInUse: mockIsTagOptionInUse,
  }),
}));

describe('ManageTagsScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTagOptionInUse.mockReturnValue(false);
  });

  it('renders existing tags', () => {
    const screen = render(
      <ManageTagsScreen
        route={{ key: '1', name: 'ManageTags' } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Headliner')).toBeTruthy();
  });

  it('deletes an unused tag', async () => {
    const screen = render(
      <ManageTagsScreen
        route={{ key: '1', name: 'ManageTags' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Headliner'));

    await waitFor(() => {
      expect(mockDeleteTagOption).toHaveBeenCalledWith('headliner');
    });
  });

  it('blocks deleting a used tag', () => {
    mockIsTagOptionInUse.mockReturnValue(true);

    const screen = render(
      <ManageTagsScreen
        route={{ key: '1', name: 'ManageTags' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Headliner'));

    expect(mockDeleteTagOption).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Cannot remove tag',
      'This tag is used by existing performances.'
    );
  });

  it('adds a new tag', async () => {
    const screen = render(
      <ManageTagsScreen
        route={{ key: '1', name: 'ManageTags' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Tag'));

    await waitFor(() => {
      expect(mockAddTagOption).toHaveBeenCalledWith('Festival');
    });
  });

  it('shows error when addTagOption fails', async () => {
    mockAddTagOption.mockRejectedValueOnce(new Error('Add tag failed'));

    const screen = render(
      <ManageTagsScreen
        route={{ key: '1', name: 'ManageTags' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Tag'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add tag',
        'Add tag failed'
      );
    });
  });

  it('shows empty state when no tags exist', () => {
    jest.doMock('../../features/performances/context/PerformancesContext', () => ({
      usePerformances: () => ({
        tagOptions: [],
        addTagOption: mockAddTagOption,
        deleteTagOption: mockDeleteTagOption,
        isTagOptionInUse: mockIsTagOptionInUse,
      }),
    }));
  });
});