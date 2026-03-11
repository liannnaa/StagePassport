import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConcertsScreen from '../../features/performances/screens/ConcertsScreen';

const mockSetConcertSearchQuery = jest.fn();
const mockSetConcertSortMode = jest.fn();

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockScreenContainer({
    children,
    title,
    subtitle,
  }: any) {
    return React.createElement(
      React.Fragment,
      null,
      title ? React.createElement(Text, null, title) : null,
      subtitle ? React.createElement(Text, null, subtitle) : null,
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
      placeholder: 'Search show, venue, city, artist...',
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

jest.mock('../../features/performances/components/ConcertGroupCard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockConcertGroupCard({ group, onPress }: any) {
    return React.createElement(
      Pressable,
      { onPress },
      React.createElement(Text, null, group.showName)
    );
  };
});

const mockUsePerformances = jest.fn();

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => mockUsePerformances(),
}));

describe('ConcertsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePerformances.mockReturnValue({
      filteredConcertGroups: [
        {
          showId: 'faye-show-04-21-26',
          showName: 'Atlanta Show',
          date: '04-21-26',
          venue: 'Fox Theatre',
          city: 'Atlanta',
          performances: [],
          artistCount: 1,
        },
      ],
      concertSearchQuery: '',
      setConcertSearchQuery: mockSetConcertSearchQuery,
      concertSortMode: 'newest',
      setConcertSortMode: mockSetConcertSortMode,
      isLoading: false,
    });
  });

  it('renders grouped concert cards', () => {
    const screen = render(<ConcertsScreen />);

    expect(screen.getByText('Concerts')).toBeTruthy();
    expect(screen.getByText('Grouped by show')).toBeTruthy();
    expect(screen.getByText('Atlanta Show')).toBeTruthy();
  });

  it('shows empty state when no concerts match', () => {
    mockUsePerformances.mockReturnValue({
      filteredConcertGroups: [],
      concertSearchQuery: '',
      setConcertSearchQuery: mockSetConcertSearchQuery,
      concertSortMode: 'newest',
      setConcertSortMode: mockSetConcertSortMode,
      isLoading: false,
    });

    const screen = render(<ConcertsScreen />);

    expect(screen.getByText('No matching concerts')).toBeTruthy();
    expect(
      screen.getByText('Try a different search or add performances first.')
    ).toBeTruthy();
  });

  it('navigates to grouped performances for a concert', () => {
    const screen = render(<ConcertsScreen />);

    fireEvent.press(screen.getByText('Atlanta Show'));

    expect(mockNavigate).toHaveBeenCalledWith('GroupedPerformances', {
      mode: 'concert',
      showId: 'faye-show-04-21-26',
      title: 'Atlanta Show',
    });
  });

  it('updates search query from user input', () => {
    const screen = render(<ConcertsScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Search show, venue, city, artist...'),
      'Atlanta'
    );

    expect(mockSetConcertSearchQuery).toHaveBeenCalledWith('Atlanta');
  });

  it('updates sort mode when a sort option is pressed', () => {
    const screen = render(<ConcertsScreen />);

    fireEvent.press(screen.getByText('Oldest'));

    expect(mockSetConcertSortMode).toHaveBeenCalledWith('oldest');
  });
});