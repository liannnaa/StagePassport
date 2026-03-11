import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PerformanceListScreen from '../../features/performances/screens/PerformanceListScreen';

const mockSetSearchQuery = jest.fn();
const mockSetSortMode = jest.fn();
const mockLogOut = jest.fn();

const mockUsePerformances = jest.fn();

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => mockUsePerformances(),
}));

jest.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    logOut: mockLogOut,
  }),
}));

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockScreenContainer({
    children,
    leftActionLabel,
    onLeftActionPress,
    rightActionLabel,
    onRightActionPress,
    title,
    subtitle,
  }: any) {
    return React.createElement(
      React.Fragment,
      null,
      title ? React.createElement(Text, null, title) : null,
      subtitle ? React.createElement(Text, null, subtitle) : null,
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
  return function MockAppScrollView({ children }: any) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('../../components/SearchBar', () => {
  const React = require('react');
  const { TextInput } = require('react-native');

  return function MockSearchBar({ value, onChangeText }: any) {
    return React.createElement(TextInput, {
      value,
      onChangeText,
      placeholder: 'Search artist, show name, venue, city...',
    });
  };
});

jest.mock('../../components/SortPills', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockSortPills({ options, onChange }: any) {
    return React.createElement(
      React.Fragment,
      null,
      ...options.map((option: any) =>
        React.createElement(
          Pressable,
          {
            key: option.value,
            onPress: () => onChange(option.value),
          },
          React.createElement(Text, null, option.label)
        )
      )
    );
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

describe('PerformanceListScreen', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePerformances.mockReturnValue({
      filteredPerformances: [
        {
          id: 'p1',
          artist: 'Faye Webster',
          venue: 'Fox Theatre',
          city: 'Atlanta',
          date: '04-21-26',
          tag: '',
          genre: 'Indie',
          subGenre: 'Indie Pop',
          showId: 'atlanta-show-04-21-26',
          showName: 'Atlanta Show',
        },
      ],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      sortMode: 'newest',
      setSortMode: mockSetSortMode,
    });
  });

  it('renders performance list content', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    expect(screen.getByText('Performances')).toBeTruthy();
    expect(screen.getByText('Track every performance')).toBeTruthy();
    expect(screen.getByText('Atlanta Show')).toBeTruthy();
  });

  it('shows empty state when there are no matching performances', () => {
    mockUsePerformances.mockReturnValue({
      filteredPerformances: [],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      sortMode: 'newest',
      setSortMode: mockSetSortMode,
    });

    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    expect(screen.getByText('No matching performances')).toBeTruthy();
    expect(
      screen.getByText('Try a different search or add a new performance.')
    ).toBeTruthy();
  });

  it('updates search query from user input', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.changeText(
      screen.getByPlaceholderText('Search artist, show name, venue, city...'),
      'Faye'
    );

    expect(mockSetSearchQuery).toHaveBeenCalledWith('Faye');
  });

  it('updates sort mode when a sort option is pressed', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.press(screen.getByText('Artist'));

    expect(mockSetSortMode).toHaveBeenCalledWith('artist');
  });

  it('navigates to add performance when Add is pressed', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.press(screen.getByText('Add'));

    expect(navigation.navigate).toHaveBeenCalledWith('PerformanceForm', {
      mode: 'add',
    });
  });

  it('navigates to performance detail when a card is pressed', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.press(screen.getByText('Atlanta Show'));

    expect(navigation.navigate).toHaveBeenCalledWith('PerformanceDetail', {
      performanceId: 'p1',
    });
  });

  it('opens settings when Settings is pressed', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.press(screen.getByText('Settings'));

    expect(navigation.navigate).toHaveBeenCalledWith('Settings');
  });
});