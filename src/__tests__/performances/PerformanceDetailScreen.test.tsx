import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PerformanceDetailScreen from '../../features/performances/screens/PerformanceDetailScreen';

const mockDeletePerformance = jest.fn();
const mockGetPerformanceById = jest.fn();

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockScreenContainer({
    children,
    leftActionLabel,
    onLeftActionPress,
    rightActionLabel,
    onRightActionPress,
    showBackButton,
    onBackPress,
    title,
    subtitle,
  }: any) {
    return React.createElement(
      React.Fragment,
      null,
      title ? React.createElement(Text, null, title) : null,
      subtitle ? React.createElement(Text, null, subtitle) : null,
      showBackButton
        ? React.createElement(
            Pressable,
            { onPress: onBackPress },
            React.createElement(Text, null, 'Back')
          )
        : null,
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

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => ({
    getPerformanceById: mockGetPerformanceById,
    deletePerformance: mockDeletePerformance,
  }),
}));

describe('PerformanceDetailScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPerformanceById.mockReturnValue({
      id: 'p1',
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'faye-show-04-21-26',
      showName: 'Atlanta Show',
    });
  });

  it('renders performance details', () => {
    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'p1' },
        } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Faye Webster')).toBeTruthy();
    expect(screen.getByText('Atlanta Show')).toBeTruthy();
    expect(screen.getByText('Indie')).toBeTruthy();
    expect(screen.getByText('Indie Pop')).toBeTruthy();
  });

  it('renders fallback when performance is not found', () => {
    mockGetPerformanceById.mockReturnValue(undefined);

    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'missing' },
        } as any}
        navigation={navigation as any}
      />
    );

    expect(screen.getByText('Performance not found.')).toBeTruthy();
  });

  it('navigates to edit screen', () => {
    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'p1' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Edit'));

    expect(navigation.navigate).toHaveBeenCalledWith('PerformanceForm', {
      mode: 'edit',
      performanceId: 'p1',
    });
  });

  it('deletes a performance after confirmation', async () => {
    alertSpy.mockImplementationOnce((_title, _message, buttons: any) => {
      buttons[1].onPress();
    });

    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'p1' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Delete Performance'));

    await waitFor(() => {
      expect(mockDeletePerformance).toHaveBeenCalledWith('p1');
    });

    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('shows delete failure alert when deletePerformance rejects', async () => {
    mockDeletePerformance.mockRejectedValueOnce(new Error('Delete failed'));

    alertSpy.mockImplementationOnce((_title, _message, buttons: any) => {
      buttons[1].onPress();
    });

    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'p1' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Delete Performance'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Delete failed', 'Delete failed');
    });
  });

  it('goes back when back is pressed', () => {
    const screen = render(
      <PerformanceDetailScreen
        route={{
          key: '1',
          name: 'PerformanceDetail',
          params: { performanceId: 'p1' },
        } as any}
        navigation={navigation as any}
      />
    );

    fireEvent.press(screen.getByText('Back'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});