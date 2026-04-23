import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PerformanceListScreen from '../../features/performances/screens/PerformanceListScreen';

const mockSetSearchQuery = jest.fn();
const mockSetSortMode = jest.fn();
const mockOpenAddMenu = jest.fn();

const mockUsePerformances = jest.fn();

const mockPerformance = {
  id: 'p1',
  artist: 'Faye Webster',
  venue: 'Fox Theatre',
  city: 'Atlanta',
  date: '04-21-26',
  billing: '',
  tags: [],
  genre: 'Indie',
  subGenre: 'Indie Pop',
  showId: 'atlanta-show-04-21-26',
  showName: 'Atlanta Show',
};

jest.mock('../../features/performances/context/PerformancesContext', () => ({
  usePerformances: () => mockUsePerformances(),
}));

jest.mock('../../features/performances/utils/openAddMenu', () => ({
  openAddMenu: (...args: unknown[]) => mockOpenAddMenu(...args),
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
    return (
      <>
        {title ? <Text>{title}</Text> : null}
        {subtitle ? <Text>{subtitle}</Text> : null}

        {leftActionLabel ? (
          <Pressable onPress={onLeftActionPress}>
            <Text>{leftActionLabel}</Text>
          </Pressable>
        ) : null}

        {rightActionLabel ? (
          <Pressable onPress={onRightActionPress}>
            <Text>{rightActionLabel}</Text>
          </Pressable>
        ) : null}

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

  return function MockSearchBar({ value, onChangeText, placeholder }: any) {
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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

jest.mock('../../features/performances/components/PerformanceCard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return function MockPerformanceCard({ performance, onPress }: any) {
    return (
      <Pressable onPress={onPress}>
        <Text>{performance.showName}</Text>
      </Pressable>
    );
  };
});

jest.mock('../../features/performances/components/ResultCount', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockResultCount({ count, total, singular, plural }: any) {
    return <Text>{`${count} of ${total} ${total === 1 ? singular : plural}`}</Text>;
  };
});

describe('PerformanceListScreen', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePerformances.mockReturnValue({
      filteredPerformances: [mockPerformance],
      performances: [mockPerformance],
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
    expect(screen.getByText('1 of 1 performance')).toBeTruthy();
  });

  it('shows empty state when there are no matching performances', () => {
    mockUsePerformances.mockReturnValue({
      filteredPerformances: [],
      performances: [mockPerformance],
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
    expect(screen.getByText('0 of 1 performance')).toBeTruthy();
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

  it('opens add menu when Add is pressed', () => {
    const screen = render(
      <PerformanceListScreen navigation={navigation as any} route={{} as any} />
    );

    fireEvent.press(screen.getByText('Add'));

    expect(mockOpenAddMenu).toHaveBeenCalledWith(navigation);
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