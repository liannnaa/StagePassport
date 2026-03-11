import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import {
  PerformancesProvider,
  usePerformances,
} from '../../features/performances/context/PerformancesContext';

const mockUseAuth = jest.fn();

const mockPerformancesSubscribe = jest.fn();
const mockPerformancesInsert = jest.fn();
const mockPerformancesUpdate = jest.fn();
const mockPerformancesDelete = jest.fn();
const mockPerformancesUpdateGenresByArtist = jest.fn();
const mockPerformancesGetAll = jest.fn();
const mockPerformancesGetById = jest.fn();

const mockVenueSubscribe = jest.fn();
const mockVenueInsert = jest.fn();
const mockVenueGetAll = jest.fn();
const mockVenueDelete = jest.fn();

const mockGenresSubscribe = jest.fn();
const mockSubGenresSubscribe = jest.fn();
const mockGenreInsert = jest.fn();
const mockSubGenreInsert = jest.fn();
const mockGenresGetAll = jest.fn();
const mockSubGenresGetAll = jest.fn();
const mockDeleteGenre = jest.fn();
const mockDeleteSubGenre = jest.fn();

const mockTagsSubscribe = jest.fn();
const mockTagInsert = jest.fn();
const mockTagGetAll = jest.fn();
const mockTagDelete = jest.fn();

const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('not wrapped in act')
    ) {
      return;
    }
    originalError(...args);
  };
});

jest.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../features/performances/repository/performancesRepository', () => ({
  performancesRepository: {
    subscribe: (...args: any[]) => mockPerformancesSubscribe(...args),
    insert: (...args: any[]) => mockPerformancesInsert(...args),
    update: (...args: any[]) => mockPerformancesUpdate(...args),
    delete: (...args: any[]) => mockPerformancesDelete(...args),
    updateGenresByArtist: (...args: any[]) =>
      mockPerformancesUpdateGenresByArtist(...args),
    getAll: (...args: any[]) => mockPerformancesGetAll(...args),
    getById: (...args: any[]) => mockPerformancesGetById(...args),
  },
}));

jest.mock('../../features/venues/repository/venueOptionsRepository', () => ({
  venueOptionsRepository: {
    subscribe: (...args: any[]) => mockVenueSubscribe(...args),
    insert: (...args: any[]) => mockVenueInsert(...args),
    getAll: (...args: any[]) => mockVenueGetAll(...args),
    deleteVenueOption: (...args: any[]) => mockVenueDelete(...args),
  },
}));

jest.mock('../../features/genres/repository/genresRepository', () => ({
  genresRepository: {
    subscribeGenres: (...args: any[]) => mockGenresSubscribe(...args),
    subscribeSubGenres: (...args: any[]) => mockSubGenresSubscribe(...args),
    insertGenre: (...args: any[]) => mockGenreInsert(...args),
    insertSubGenre: (...args: any[]) => mockSubGenreInsert(...args),
    getAllGenres: (...args: any[]) => mockGenresGetAll(...args),
    getAllSubGenres: (...args: any[]) => mockSubGenresGetAll(...args),
    deleteGenre: (...args: any[]) => mockDeleteGenre(...args),
    deleteSubGenre: (...args: any[]) => mockDeleteSubGenre(...args),
  },
}));

jest.mock('../../features/tags/repository/tagsRepository', () => ({
  tagsRepository: {
    subscribe: (...args: any[]) => mockTagsSubscribe(...args),
    insert: (...args: any[]) => mockTagInsert(...args),
    getAll: (...args: any[]) => mockTagGetAll(...args),
    delete: (...args: any[]) => mockTagDelete(...args),
  },
}));

function TestConsumer({
  onReady,
}: {
  onReady: (value: ReturnType<typeof usePerformances>) => void;
}) {
  const value = usePerformances();

  React.useEffect(() => {
    onReady(value);
  }, [value, onReady]);

  return null;
}

describe('PerformancesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        uid: 'user-1',
        email: 'test@example.com',
      },
    });

    mockPerformancesSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
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
        ]);
        return jest.fn();
      }
    );

    mockVenueSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([]);
        return jest.fn();
      }
    );

    mockGenresSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([]);
        return jest.fn();
      }
    );

    mockSubGenresSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([]);
        return jest.fn();
      }
    );

    mockTagsSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([]);
        return jest.fn();
      }
    );

    mockGenreInsert.mockResolvedValue({
      id: 'indie',
      name: 'Indie',
      normalizedName: 'indie',
    });

    mockSubGenreInsert.mockResolvedValue({
      id: 'indie-indie-pop',
      genreId: 'indie',
      name: 'Indie Pop',
      normalizedKey: 'indie-indie-pop',
    });

    mockTagInsert.mockResolvedValue({
      id: 'headliner',
      name: 'Headliner',
      normalizedName: 'headliner',
    });

    mockVenueInsert.mockResolvedValue({
      id: 'fox-theatre-atlanta',
      venueName: 'Fox Theatre',
      city: 'Atlanta',
      normalizedKey: 'fox-theatre-atlanta',
    });

    mockPerformancesGetAll.mockResolvedValue([
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
    ]);

    mockVenueGetAll.mockResolvedValue([]);
    mockGenresGetAll.mockResolvedValue([]);
    mockSubGenresGetAll.mockResolvedValue([]);
    mockTagGetAll.mockResolvedValue([]);

    mockPerformancesInsert.mockResolvedValue('new-id');
    mockPerformancesUpdate.mockResolvedValue(undefined);
    mockPerformancesDelete.mockResolvedValue(undefined);
    mockPerformancesUpdateGenresByArtist.mockResolvedValue(undefined);
  });

  it('populates state from repository subscriptions', async () => {
    const onReady = jest.fn();

    render(
      <PerformancesProvider>
        <TestConsumer onReady={onReady} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      const latest = onReady.mock.calls[onReady.mock.calls.length - 1][0];
      expect(latest.performances).toHaveLength(1);
      expect(latest.performances[0].artist).toBe('Faye Webster');
      expect(latest.isLoading).toBe(false);
    });
  });

  it('adds a performance and writes related catalog entries', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.addPerformance({
      artist: 'Faye Webster',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '04-21-26',
      tag: 'Headliner',
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showName: 'Atlanta Show',
    });

    expect(mockPerformancesInsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        artist: 'Faye Webster',
        showName: 'Atlanta Show',
      })
    );
    expect(mockVenueInsert).toHaveBeenCalled();
    expect(mockGenreInsert).toHaveBeenCalledWith('user-1', 'Indie');
    expect(mockSubGenreInsert).toHaveBeenCalledWith(
      'user-1',
      'indie',
      'Indie',
      'Indie Pop'
    );
    expect(mockTagInsert).toHaveBeenCalledWith('user-1', 'Headliner');
  });

  it('updates a performance', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.updatePerformance('p1', {
      artist: 'Faye Webster',
      venue: '',
      city: '',
      date: '04-21-26',
      tag: '',
      genre: '',
      subGenre: '',
      showName: 'Updated Show',
    });

    expect(mockPerformancesUpdate).toHaveBeenCalledWith(
      'user-1',
      'p1',
      expect.objectContaining({
        showName: 'Updated Show',
      })
    );
  });

  it('deletes a performance', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.deletePerformance('p1');

    expect(mockPerformancesDelete).toHaveBeenCalledWith('user-1', 'p1');
  });

  it('syncs genre and sub-genre across matching artist performances', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.syncGenresForArtist(
      'Faye Webster',
      'Indie',
      'Indie Pop'
    );

    expect(mockPerformancesUpdateGenresByArtist).toHaveBeenCalledWith(
      'user-1',
      'Faye Webster',
      'Indie',
      'Indie Pop'
    );
    expect(mockGenreInsert).toHaveBeenCalledWith('user-1', 'Indie');
    expect(mockSubGenreInsert).toHaveBeenCalledWith(
      'user-1',
      'indie',
      'Indie',
      'Indie Pop'
    );
  });

  it('throws on protected actions when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
    });

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await expect(
      contextValue!.addPerformance({
        artist: 'Faye Webster',
        venue: '',
        city: '',
        date: '04-21-26',
        tag: '',
        genre: '',
        subGenre: '',
        showName: 'Atlanta Show',
      })
    ).rejects.toThrow('You must be logged in to add a performance.');
  });

  it('clears all collections when no user is available', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
      expect(contextValue!.performances).toEqual([]);
      expect(contextValue!.venueOptions).toEqual([]);
      expect(contextValue!.genreOptions).toEqual([]);
      expect(contextValue!.subGenreOptions).toEqual([]);
      expect(contextValue!.tagOptions).toEqual([]);
    });
  });

  it('refresh reloads all collections', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.refresh();

    expect(mockPerformancesGetAll).toHaveBeenCalledWith('user-1');
    expect(mockVenueGetAll).toHaveBeenCalledWith('user-1');
    expect(mockGenresGetAll).toHaveBeenCalledWith('user-1');
    expect(mockSubGenresGetAll).toHaveBeenCalledWith('user-1');
    expect(mockTagGetAll).toHaveBeenCalledWith('user-1');
  });

  it('returns undefined for missing lookup values', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    expect(contextValue!.getPerformanceById('missing')).toBeUndefined();
    expect(contextValue!.getGenreById('missing')).toBeUndefined();
  });

  it('returns true when a tag option is in use', async () => {
    mockPerformancesSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
          {
            id: 'p1',
            artist: 'Faye Webster',
            venue: 'Fox Theatre',
            city: 'Atlanta',
            date: '04-21-26',
            tag: 'headliner',
            genre: 'Indie',
            subGenre: 'Indie Pop',
            showId: 'atlanta-show-04-21-26',
            showName: 'Atlanta Show',
          },
        ]);
        return jest.fn();
      }
    );

    mockTagsSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
          {
            id: 'headliner',
            name: 'Headliner',
            normalizedName: 'headliner',
          },
        ]);
        return jest.fn();
      }
    );

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    expect(contextValue!.isTagOptionInUse('headliner')).toBe(true);
  });

  it('adds and deletes a venue option', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.addVenueOption('The Eastern', 'Atlanta');
    expect(mockVenueInsert).toHaveBeenCalledWith('user-1', 'The Eastern', 'Atlanta');

    await contextValue!.deleteVenueOption('fox theatre::atlanta');
    expect(mockVenueDelete).toHaveBeenCalledWith('user-1', 'fox theatre::atlanta');
  });

  it('adds and deletes a tag option', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.addTagOption('Festival');
    expect(mockTagInsert).toHaveBeenCalledWith('user-1', 'Festival');

    await contextValue!.deleteTagOption('headliner');
    expect(mockTagDelete).toHaveBeenCalledWith('user-1', 'headliner');
  });

  it('adds and deletes genre and sub-genre options', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.addGenreOption('Alternative');
    expect(mockGenreInsert).toHaveBeenCalledWith('user-1', 'Alternative');

    await contextValue!.addSubGenreOption('indie', 'Indie', 'Dream Pop');
    expect(mockSubGenreInsert).toHaveBeenCalledWith(
      'user-1',
      'indie',
      'Indie',
      'Dream Pop'
    );

    await contextValue!.deleteGenreOption('indie');
    expect(mockDeleteGenre).toHaveBeenCalledWith('user-1', 'indie');

    await contextValue!.deleteSubGenreOption('indie::indie pop');
    expect(mockDeleteSubGenre).toHaveBeenCalledWith('user-1', 'indie::indie pop');
  });

  it('throws on all protected catalog and update actions when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await expect(
      contextValue!.updatePerformance('p1', {
        artist: 'Faye Webster',
        venue: '',
        city: '',
        date: '04-21-26',
        tag: '',
        genre: '',
        subGenre: '',
        showName: 'Atlanta Show',
      })
    ).rejects.toThrow('You must be logged in to update a performance.');

    await expect(contextValue!.deletePerformance('p1')).rejects.toThrow(
      'You must be logged in to delete a performance.'
    );

    await expect(
      contextValue!.addVenueOption('Fox Theatre', 'Atlanta')
    ).rejects.toThrow('You must be logged in to add a venue.');

    await expect(
      contextValue!.deleteVenueOption('fox theatre::atlanta')
    ).rejects.toThrow('You must be logged in to delete a venue.');

    await expect(
      contextValue!.addGenreOption('Indie')
    ).rejects.toThrow('You must be logged in to add a genre.');

    await expect(
      contextValue!.deleteGenreOption('indie')
    ).rejects.toThrow('You must be logged in to delete a genre.');

    await expect(
      contextValue!.addSubGenreOption('indie', 'Indie', 'Indie Pop')
    ).rejects.toThrow('You must be logged in to add a sub-genre.');

    await expect(
      contextValue!.deleteSubGenreOption('indie::indie pop')
    ).rejects.toThrow('You must be logged in to delete a sub-genre.');

    await expect(
      contextValue!.addTagOption('Headliner')
    ).rejects.toThrow('You must be logged in to add a tag.');

    await expect(
      contextValue!.deleteTagOption('headliner')
    ).rejects.toThrow('You must be logged in to delete a tag.');
  });

  it('does nothing when syncGenresForArtist is called with a blank artist name', async () => {
    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.syncGenresForArtist('   ', 'Indie', 'Indie Pop');

    expect(mockPerformancesUpdateGenresByArtist).not.toHaveBeenCalled();
    expect(mockGenreInsert).not.toHaveBeenCalled();
    expect(mockSubGenreInsert).not.toHaveBeenCalled();
  });

  it('does nothing when syncGenresForArtist is called without a user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await contextValue!.syncGenresForArtist('Faye Webster', 'Indie', 'Indie Pop');

    expect(mockPerformancesUpdateGenresByArtist).not.toHaveBeenCalled();
    expect(mockGenreInsert).not.toHaveBeenCalled();
    expect(mockSubGenreInsert).not.toHaveBeenCalled();
  });

  it('returns true for venue, genre, and sub-genre options that are in use', async () => {
    mockVenueSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
          {
            id: 'fox-theatre-atlanta',
            venueName: 'Fox Theatre',
            city: 'Atlanta',
            normalizedKey: 'fox-theatre-atlanta',
          },
        ]);
        return jest.fn();
      }
    );

    mockGenresSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
          {
            id: 'indie',
            name: 'Indie',
            normalizedName: 'indie',
          },
        ]);
        return jest.fn();
      }
    );

    mockSubGenresSubscribe.mockImplementation(
      (_uid: string, onData: (items: any[]) => void) => {
        onData([
          {
            id: 'indie-indie-pop',
            genreId: 'indie',
            name: 'Indie Pop',
            normalizedKey: 'indie-indie-pop',
          },
        ]);
        return jest.fn();
      }
    );

    let contextValue: ReturnType<typeof usePerformances> | undefined;

    render(
      <PerformancesProvider>
        <TestConsumer onReady={(value) => (contextValue = value)} />
      </PerformancesProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    expect(contextValue!.isVenueOptionInUse('fox-theatre-atlanta')).toBe(true);
    expect(contextValue!.isGenreOptionInUse('indie')).toBe(true);
    expect(contextValue!.isSubGenreOptionInUse('indie-indie-pop')).toBe(true);
  });

  it('throws when usePerformances is used outside the provider', () => {
    function BadConsumer() {
      usePerformances();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'usePerformances must be used within a PerformancesProvider'
    );
  });
});