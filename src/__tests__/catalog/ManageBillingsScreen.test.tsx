import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageBillingsScreen from '../../features/catalog/screens/ManageBillingsScreen';

const mockAddBillingOption = jest.fn();
const mockDeleteBillingOption = jest.fn();
const mockIsBillingOptionInUse = jest.fn();

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

jest.mock('../../features/billings/components/AddBillingModal', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockAddBillingModal({
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
        React.createElement(Text, null, 'Confirm Add Billing')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Close Billing Modal')
      )
    );
  };
});

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    billingOptions: [
      { id: 'headliner', name: 'Headliner', normalizedName: 'headliner' },
    ],
    addBillingOption: mockAddBillingOption,
    deleteBillingOption: mockDeleteBillingOption,
    isBillingOptionInUse: mockIsBillingOptionInUse,
  }),
}));

describe('ManageBillingsScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsBillingOptionInUse.mockReturnValue(false);
  });

  it('renders existing billings', () => {
    const screen = render(
      <ManageBillingsScreen
        route={{ key: '1', name: 'ManageBillings' } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Headliner')).toBeTruthy();
  });

  it('deletes an unused billing', async () => {
    alertSpy.mockImplementation((title, message, buttons) => {
      buttons?.find((button) => button.text === 'Remove')?.onPress?.();
    });

    const screen = render(
      <ManageBillingsScreen
        route={{ key: '1', name: 'ManageBillings' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Headliner'));

    await waitFor(() => {
      expect(mockDeleteBillingOption).toHaveBeenCalledWith('headliner');
    });
  });

  it('blocks deleting a used billing', () => {
    mockIsBillingOptionInUse.mockReturnValue(true);

    const screen = render(
      <ManageBillingsScreen
        route={{ key: '1', name: 'ManageBillings' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Remove Headliner'));

    expect(mockDeleteBillingOption).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Billing is in use',
      'Open the usage list to replace or remove this billing from performances first.'
    );
  });

  it('adds a new billing', async () => {
    const screen = render(
      <ManageBillingsScreen
        route={{ key: '1', name: 'ManageBillings' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Billing'));

    await waitFor(() => {
      expect(mockAddBillingOption).toHaveBeenCalledWith('Festival');
    });
  });

  it('shows error when addBillingOption fails', async () => {
    mockAddBillingOption.mockRejectedValueOnce(new Error('Add billing failed'));

    const screen = render(
      <ManageBillingsScreen
        route={{ key: '1', name: 'ManageBillings' } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Confirm Add Billing'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to add billing',
        'Add billing failed'
      );
    });
  });

  it('shows empty state when no billings exist', () => {
    jest.doMock('../../features/performances/context/PerformancesContext', () => ({
      usePerformances: () => ({
        billingOptions: [],
        addBillingOption: mockAddBillingOption,
        deleteBillingOption: mockDeleteBillingOption,
        isBillingOptionInUse: mockIsBillingOptionInUse,
      }),
    }));
  });
});