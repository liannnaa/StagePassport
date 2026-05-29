import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageVenuesScreen from '../../features/catalog/screens/ManageVenuesScreen';

const mockAddVenueOption = jest.fn();
const mockDeleteVenueOption = jest.fn();
const mockIsVenueOptionInUse = jest.fn();

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
    subtitle,
    onDelete,
    disabledReason,
  }: {
    title: string;
    subtitle?: string;
    onDelete: () => void;
    disabledReason?: string;
  }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, title),
      subtitle ? React.createElement(Text, null, subtitle) : null,
      disabledReason ? React.createElement(Text, null, disabledReason) : null,
      React.createElement(
        Pressable,
        { onPress: onDelete },
        React.createElement(Text, null, `Remove ${title}`)
      )
    );
  };
});

jest.mock('../../features/venues/components/AddVenueModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddVenueModal({
    visible,
    onSave,
    onClose,
  }: {
    visible: boolean;
    onSave: (venueName: string, city: string) => void | Promise<void>;
    onClose: () => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Pressable,
        { onPress: () => onSave('Fox Theatre', 'Atlanta') },
        React.createElement(Text, null, 'Confirm Add Venue')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Close Venue Modal')
      )
    );
  };
});

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    venueOptions: [
      {
        id: 'fox-theatre-atlanta',
        venueName: 'Fox Theatre',
        city: 'Atlanta',
        normalizedKey: 'fox-theatre-atlanta',
      },
    ],
    addVenueOption: mockAddVenueOption,
    deleteVenueOption: mockDeleteVenueOption,
    isVenueOptionInUse: mockIsVenueOptionInUse,
  }),
}));

describe('ManageVenuesScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const navigation = { goBack: jest.fn() };

  function confirmRemoveAlert() {
    alertSpy.mockImplementation((title, message, buttons) => {
      buttons?.find((button) => button.text === 'Remove')?.onPress?.();
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsVenueOptionInUse.mockReturnValue(false);
  });

  it('renders existing venues', () => {
    const screen = render(
      <ManageVenuesScreen
        route={{ key: '1', name: 'ManageVenues' } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Fox Theatre')).toBeTruthy();
    expect(screen.getByText('Atlanta')).toBeTruthy();
  });

  it('deletes an unused venue', async () => {
    confirmRemoveAlert();

    const screen = render(
      <ManageVenuesScreen
        route={{ key: '1', name: 'ManageVenues' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Fox Theatre'));

    await waitFor(() => {
      expect(mockDeleteVenueOption).toHaveBeenCalledWith('fox-theatre-atlanta');
    });
  });

  it('blocks deleting a used venue', () => {
    mockIsVenueOptionInUse.mockReturnValue(true);

    const screen = render(
      <ManageVenuesScreen
        route={{ key: '1', name: 'ManageVenues' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Fox Theatre'));

    expect(mockDeleteVenueOption).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Venue is in use',
      'Open the usage list to replace or remove this venue from performances first.'
    );
  });

  it('adds a new venue', async () => {
    const screen = render(
      <ManageVenuesScreen
        route={{ key: '1', name: 'ManageVenues' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Venue'));

    await waitFor(() => {
      expect(mockAddVenueOption).toHaveBeenCalledWith('Fox Theatre', 'Atlanta');
    });
  });

  it('shows error when addVenueOption fails', async () => {
    mockAddVenueOption.mockRejectedValueOnce(new Error('Add venue failed'));

    const screen = render(
      <ManageVenuesScreen
        route={{ key: '1', name: 'ManageVenues' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Venue'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add venue',
        'Add venue failed'
      );
    });
  });
});