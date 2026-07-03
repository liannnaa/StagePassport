import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArtistsScreen from '../../features/performances/screens/ArtistsScreen';

const mockSetArtistSearchQuery = jest.fn();
const mockSetArtistSortMode = jest.fn();
const mockNavigate = jest.fn();

const mockArtistGroups = [
  {
    artistName: 'Faye Webster',
    performances: [],
    performanceCount: 2,
    latestDate: '04-21-26',
    genre: 'Indie',
    subGenre: 'Indie Pop',
  },
];

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../components/ScreenContainer', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockScreenContainer({ children, title, subtitle }: any) {
    return (
      <>
        {title ? <Text>{title}</Text> : null}
        {subtitle ? <Text>{subtitle}</Text> : null}
        {children}
      </>
    );
  };
});

jest.mock('../../components/AppScrollView', () => {
  const React = require('react');

  return function MockAppScrollView({ children }: any) {
    return <>{children}</>;
  };
});

jest.mock('../../components/SearchBar', () => {
  const React = require('react');
  const { TextInput } = require('react-native');

  return function MockSearchBar({ value, onChangeText }: any) {
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search artist..."
      />
    );
  };
});

jest.mock('../../components/SortPills', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockSortPills({ options, onChange }: any) {
    return (
      <>
        {options.map((option: any) => (
          <Pressable key={option.value} onPress={() => onChange(option.value)}>
            <Text>{option.label}</Text>
          </Pressable>
        ))}
      </>
    );
  };
});

jest.mock('../../components/EmptyState', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockEmptyState({ title, body }: any) {
    return (
      <>
        <Text>{title}</Text>
        <Text>{body}</Text>
      </>
    );
  };
});

jest.mock('../../features/performances/components/ArtistGroupCard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockArtistGroupCard({ group, onPress }: any) {
    return (
      <Pressable onPress={onPress}>
        <Text>{group.artistName}</Text>
      </Pressable>
    );
  };
});

const mockUsePerformances = jest.fn();

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => mockUsePerformances(),
}));

describe('ArtistsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePerformances.mockReturnValue({
      filteredArtistGroups: mockArtistGroups,
      artistGroups: mockArtistGroups,
      artistSearchQuery: '',
      setArtistSearchQuery: mockSetArtistSearchQuery,
      artistSortMode: 'artist',
      setArtistSortMode: mockSetArtistSortMode,
      isLoading: false,
    });
  });

  it('renders grouped artist cards', () => {
    const screen = render(<ArtistsScreen />);

    expect(screen.getByText('Artists')).toBeTruthy();
    expect(screen.getByText('Grouped by artist')).toBeTruthy();
    expect(screen.getByText('Faye Webster')).toBeTruthy();
  });

  it('shows empty state when no artists match', () => {
    mockUsePerformances.mockReturnValue({
      filteredArtistGroups: [],
      artistGroups: [],
      artistSearchQuery: '',
      setArtistSearchQuery: mockSetArtistSearchQuery,
      artistSortMode: 'artist',
      setArtistSortMode: mockSetArtistSortMode,
      isLoading: false,
    });

    const screen = render(<ArtistsScreen />);

    expect(screen.getByText('No matching artists')).toBeTruthy();
    expect(
      screen.getByText('Try a different search or add performances first.')
    ).toBeTruthy();
  });

  it('navigates to grouped performances for an artist', () => {
    const screen = render(<ArtistsScreen />);

    fireEvent.press(screen.getByText('Faye Webster'));

    expect(mockNavigate).toHaveBeenCalledWith('GroupedPerformances', {
      mode: 'artist',
      artistName: 'Faye Webster',
      title: 'Faye Webster',
    });
  });

  it('updates search query from user input', () => {
    const screen = render(<ArtistsScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Search artist...'),
      'Faye'
    );

    expect(mockSetArtistSearchQuery).toHaveBeenCalledWith('Faye');
  });

  it('updates sort mode when a sort option is pressed', () => {
    const screen = render(<ArtistsScreen />);

    fireEvent.press(screen.getByText('Most Seen'));

    expect(mockSetArtistSortMode).toHaveBeenCalledWith('mostPerformances');
  });
});