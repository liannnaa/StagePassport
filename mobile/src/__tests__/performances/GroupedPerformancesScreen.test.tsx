import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GroupedPerformancesScreen from '../../features/performances/screens/GroupedPerformancesScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockUsePerformances = jest.fn();

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => mockUsePerformances(),
}));

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockScreenContainer({
    children,
    title,
    subtitle,
    showBackButton,
    onBackPress,
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
      children
    );
  };
});

jest.mock('../../components/AppScrollView', () => {
  const React = require('react');
  return function MockAppScrollView({ children }: any) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('../../components/EmptyState', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockEmptyState({ title, body }: any) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, body)
    );
  };
});

jest.mock('../../features/performances/components/PerformanceCard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockPerformanceCard({ performance, onPress }: any) {
    return React.createElement(
      Pressable,
      { onPress },
      React.createElement(Text, null, performance.showName)
    );
  };
});

describe('GroupedPerformancesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePerformances.mockReturnValue({
      performances: [
        {
          id: 'p1',
          artist: 'Faye Webster',
          venue: 'Fox Theatre',
          city: 'Atlanta',
          date: '04-21-26',
          billing: '',
          genre: 'Indie',
          subGenre: 'Indie Pop',
          showId: 'atlanta-show-04-21-26',
          showName: 'Atlanta Show',
        },
        {
          id: 'p2',
          artist: 'Faye Webster',
          venue: 'Fox Theatre',
          city: 'Atlanta',
          date: '04-21-26',
          billing: '',
          genre: 'Indie',
          subGenre: 'Indie Pop',
          showId: 'atlanta-show-04-21-26',
          showName: 'Atlanta Show',
        },
      ],
    });
  });

  it('shows performances for a concert group', () => {
    const screen = render(
        <GroupedPerformancesScreen
        route={{
            key: '1',
            name: 'GroupedPerformances',
            params: {
            mode: 'concert',
            showId: 'atlanta-show-04-21-26',
            title: 'Atlanta Show',
            },
        } as any}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any}
        />
    );

    expect(screen.getAllByText('Atlanta Show').length).toBeGreaterThan(0);
    expect(screen.getByText('2 performances')).toBeTruthy();
    });

  it('shows performances for an artist group', () => {
    const screen = render(
      <GroupedPerformancesScreen
        route={{
          key: '1',
          name: 'GroupedPerformances',
          params: {
            mode: 'artist',
            artistName: 'Faye Webster',
            title: 'Faye Webster',
          },
        } as any}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any}
      />
    );

    expect(screen.getByText('Faye Webster')).toBeTruthy();
    expect(screen.getByText('2 performances')).toBeTruthy();
  });

  it('shows empty state when no performances match', () => {
    const screen = render(
      <GroupedPerformancesScreen
        route={{
          key: '1',
          name: 'GroupedPerformances',
          params: {
            mode: 'concert',
            showId: 'missing-show',
            title: 'Missing Show',
          },
        } as any}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any}
      />
    );

    expect(screen.getByText('No performances found')).toBeTruthy();
    expect(
      screen.getByText('There are no matching performances for this view.')
    ).toBeTruthy();
  });

  it('navigates to performance detail when a card is pressed', () => {
    const screen = render(
      <GroupedPerformancesScreen
        route={{
          key: '1',
          name: 'GroupedPerformances',
          params: {
            mode: 'concert',
            showId: 'atlanta-show-04-21-26',
            title: 'Atlanta Show',
          },
        } as any}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any}
      />
    );

    fireEvent.press(screen.getAllByText('Atlanta Show')[1]);

    expect(mockNavigate).toHaveBeenCalledWith('PerformanceDetail', {
      performanceId: 'p1',
    });
  });
});