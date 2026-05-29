import { renderHook, act } from '@testing-library/react-native';
import { usePerformanceActions } from '../../features/performances/hooks/usePerformanceActions';

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockInsertMany = jest.fn();
const mockUpdateMany = jest.fn();
const mockDeleteMany = jest.fn();
const mockSyncCatalogOptions = jest.fn();

jest.mock('../../features/performances/repository/performancesRepository', () => ({
  performancesRepository: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    insertMany: (...args: unknown[]) => mockInsertMany(...args),
    updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
  },
}));

jest.mock('../../features/performances/services/catalogSyncService', () => ({
  syncCatalogOptions: (...args: unknown[]) => mockSyncCatalogOptions(...args),
}));

const user = { uid: 'user-1' };

const performances = [
  {
    id: 'p1',
    artist: 'Faye Webster',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Headliner',
    tags: ['favorite'],
    genre: 'Indie Pop',
    subGenre: 'Singer-songwriter',
    showId: 'atlanta-show-2026-05-01',
  },
  {
    id: 'p2',
    artist: 'Lomelda',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Support',
    tags: ['opener'],
    genre: 'Indie Rock',
    subGenre: '',
    showId: 'atlanta-show-2026-05-01',
  },
  {
    id: 'p3',
    artist: 'Faye Webster',
    showName: 'Solo Show',
    venue: 'Tabernacle',
    city: 'Atlanta',
    date: '2026-06-01',
    billing: '',
    tags: [],
    genre: 'Indie Pop',
    subGenre: '',
    showId: 'solo-show-2026-06-01',
  },
];

const getArtistGenreDefault = jest.fn((artistName: string) => {
  if (artistName.trim().toLowerCase() === 'faye webster') {
    return {
      genre: 'Indie Pop',
      subGenre: 'Singer-songwriter',
    };
  }

  return undefined;
});

function renderUsePerformanceActions(overrides = {}) {
  return renderHook(() =>
    usePerformanceActions({
      user,
      performances,
      getArtistGenreDefault,
      ...overrides,
    })
  );
}

const performancePayload = {
  artist: 'Faye Webster',
  showName: 'Atlanta Show',
  venue: 'Fox Theatre',
  city: 'Atlanta',
  date: '2026-05-01',
  billing: 'Headliner',
  tags: ['favorite'],
  genre: 'Indie Pop',
  subGenre: 'Singer-songwriter',
};

describe('usePerformanceActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockInsert.mockResolvedValue('new-id');
    mockUpdate.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
    mockInsertMany.mockResolvedValue(undefined);
    mockUpdateMany.mockResolvedValue(undefined);
    mockDeleteMany.mockResolvedValue(undefined);
    mockSyncCatalogOptions.mockResolvedValue(undefined);
  });

  it('adds a performance and syncs catalog options', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await expect(result.current.addPerformance(performancePayload)).resolves.toBe(
        'new-id'
      );
    });

    expect(mockInsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        artist: 'Faye Webster',
        showId: 'atlanta-show-2026-05-01',
      })
    );

    expect(mockSyncCatalogOptions).toHaveBeenCalledWith('user-1', [
      {
        venue: 'Fox Theatre',
        city: 'Atlanta',
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
        billing: 'Headliner',
        tags: ['favorite'],
      },
    ]);
  });

  it('updates a performance and syncs catalog options', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.updatePerformance('p1', performancePayload);
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      'user-1',
      'p1',
      expect.objectContaining({
        artist: 'Faye Webster',
        showId: 'atlanta-show-2026-05-01',
      })
    );

    expect(mockSyncCatalogOptions).toHaveBeenCalled();
  });

  it('deletes a performance', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.deletePerformance('p1');
    });

    expect(mockDelete).toHaveBeenCalledWith('user-1', 'p1');
  });

  it('throws auth errors for single-performance actions', async () => {
    const { result } = renderUsePerformanceActions({ user: null });

    await expect(result.current.addPerformance(performancePayload)).rejects.toThrow(
      'You must be logged in to add a performance.'
    );

    await expect(
      result.current.updatePerformance('p1', performancePayload)
    ).rejects.toThrow('You must be logged in to update a performance.');

    await expect(result.current.deletePerformance('p1')).rejects.toThrow(
      'You must be logged in to delete a performance.'
    );
  });

  it('gets performances by id, show id, and artist name', () => {
    const { result } = renderUsePerformanceActions();

    expect(result.current.getPerformanceById('p1')).toEqual(performances[0]);
    expect(result.current.getPerformanceById('missing')).toBeUndefined();

    expect(result.current.getPerformancesByShowId('atlanta-show-2026-05-01')).toEqual([
      performances[0],
      performances[1],
    ]);

    expect(result.current.getPerformancesByArtistName(' faye webster ')).toEqual([
      performances[0],
      performances[2],
    ]);
  });

  it('deletes concert performances', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.deleteConcertPerformances('atlanta-show-2026-05-01');
    });

    expect(mockDeleteMany).toHaveBeenCalledWith('user-1', ['p1', 'p2']);
  });

  it('throws when deleting a missing concert or without user', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.deleteConcertPerformances('atlanta-show-2026-05-01')
    ).rejects.toThrow('You must be logged in to delete a concert.');

    await expect(
      result.current.deleteConcertPerformances('missing')
    ).rejects.toThrow('Concert not found.');
  });

  it('deletes artist performances', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.deleteArtistPerformances(' faye webster ');
    });

    expect(mockDeleteMany).toHaveBeenCalledWith('user-1', ['p1', 'p3']);
  });

  it('throws when deleting a missing artist or without user', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.deleteArtistPerformances('Faye Webster')
    ).rejects.toThrow('You must be logged in to delete an artist.');

    await expect(result.current.deleteArtistPerformances('Missing')).rejects.toThrow(
      'Artist not found.'
    );
  });

  it('adds concert performances, trims rows, applies artist defaults, removes duplicate rows, and syncs catalog', async () => {
    const { result } = renderUsePerformanceActions({ performances: [] });

    await act(async () => {
      await result.current.addConcertPerformances({
        shared: {
          showName: ' Atlanta Show ',
          venue: ' Fox Theatre ',
          city: ' Atlanta ',
          date: ' 2026-05-01 ',
        },
        artists: [
          {
            artist: ' Faye Webster ',
            billing: ' Headliner ',
            tags: [' favorite '],
            genre: '',
            subGenre: '',
          },
          {
            artist: 'Faye Webster',
            billing: 'Headliner',
            tags: ['favorite'],
            genre: '',
            subGenre: '',
          },
          {
            artist: '   ',
            billing: '',
            tags: [],
            genre: '',
            subGenre: '',
          },
        ],
      });
    });

    expect(mockInsertMany).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({
        artist: 'Faye Webster',
        venue: 'Fox Theatre',
        city: 'Atlanta',
        date: '2026-05-01',
        billing: 'Headliner',
        tags: ['favorite'],
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
        showName: 'Atlanta Show',
        showId: 'atlanta-show-2026-05-01',
      }),
    ]);

    expect(mockSyncCatalogOptions).toHaveBeenCalledWith('user-1', [
      {
        venue: 'Fox Theatre',
        city: 'Atlanta',
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
        billing: 'Headliner',
        tags: ['favorite'],
      },
    ]);
  });

  it('blocks duplicate concert rows that already exist', async () => {
    const { result } = renderUsePerformanceActions();

    await expect(
      result.current.addConcertPerformances({
        shared: {
          showName: 'Atlanta Show',
          venue: 'Fox Theatre',
          city: 'Atlanta',
          date: '2026-05-01',
        },
        artists: [
          {
            artist: 'Faye Webster',
            billing: 'Headliner',
            tags: ['favorite'],
            genre: 'Indie Pop',
            subGenre: 'Singer-songwriter',
          },
        ],
      })
    ).rejects.toThrow('These artists are already saved for this concert.');
  });

  it('validates add concert payloads and auth', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.addConcertPerformances({
        shared: { showName: 'Show', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('You must be logged in to add a concert.');

    await expect(
      result.current.addConcertPerformances({
        shared: { showName: '', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('Show name is required.');

    await expect(
      result.current.addConcertPerformances({
        shared: { showName: 'Show', venue: '', city: '', date: '' },
        artists: [],
      })
    ).rejects.toThrow('Date is required.');

    await expect(
      result.current.addConcertPerformances({
        shared: { showName: 'Show', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('Add at least one artist.');
  });

  it('prevents overlapping concert saves and resets after completion', async () => {
    let resolveInsertMany: () => void = () => undefined;

    mockInsertMany.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveInsertMany = resolve;
      })
    );

    const { result } = renderUsePerformanceActions({ performances: [] });

    const payload = {
      shared: {
        showName: 'Atlanta Show',
        venue: 'Fox Theatre',
        city: 'Atlanta',
        date: '2026-05-01',
      },
      artists: [
        {
          artist: 'Faye Webster',
          billing: '',
          tags: [],
          genre: '',
          subGenre: '',
        },
      ],
    };

    const firstSave = result.current.addConcertPerformances(payload);

    await expect(result.current.addConcertPerformances(payload)).rejects.toThrow(
      'A concert save is already in progress.'
    );

    await act(async () => {
      resolveInsertMany();
      await firstSave;
    });

    await act(async () => {
      await result.current.addConcertPerformances({
        ...payload,
        artists: [{ ...payload.artists[0], artist: 'Lomelda' }],
      });
    });

    expect(mockInsertMany).toHaveBeenCalledTimes(2);
  });

  it('updates concert performances by deleting removed rows, updating existing rows, inserting new rows, and syncing catalog', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.updateConcertPerformances('atlanta-show-2026-05-01', {
        shared: {
          showName: 'Updated Show',
          venue: 'New Venue',
          city: 'Atlanta',
          date: '2026-07-01',
        },
        artists: [
          {
            performanceId: 'p1',
            artist: 'Faye Webster',
            billing: 'Headliner',
            tags: ['favorite'],
            genre: 'Indie Pop',
            subGenre: '',
          },
          {
            artist: 'New Artist',
            billing: 'Support',
            tags: ['new'],
            genre: 'Rock',
            subGenre: '',
          },
        ],
      });
    });

    expect(mockDeleteMany).toHaveBeenCalledWith('user-1', ['p2']);

    expect(mockUpdateMany).toHaveBeenCalledWith('user-1', [
      {
        id: 'p1',
        performance: expect.objectContaining({
          artist: 'Faye Webster',
          showName: 'Updated Show',
          venue: 'New Venue',
          showId: 'updated-show-2026-07-01',
        }),
      },
    ]);

    expect(mockInsertMany).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({
        artist: 'New Artist',
        showName: 'Updated Show',
        venue: 'New Venue',
      }),
    ]);

    expect(mockSyncCatalogOptions).toHaveBeenCalled();
  });

  it('validates update concert payloads and auth', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.updateConcertPerformances('show', {
        shared: { showName: 'Show', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('You must be logged in to edit a concert.');

    await expect(
      result.current.updateConcertPerformances('show', {
        shared: { showName: '', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('Show name is required.');

    await expect(
      result.current.updateConcertPerformances('show', {
        shared: { showName: 'Show', venue: '', city: '', date: '' },
        artists: [],
      })
    ).rejects.toThrow('Date is required.');

    await expect(
      result.current.updateConcertPerformances('missing', {
        shared: { showName: 'Show', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('Concert not found.');

    await expect(
      result.current.updateConcertPerformances('atlanta-show-2026-05-01', {
        shared: { showName: 'Show', venue: '', city: '', date: '2026-05-01' },
        artists: [],
      })
    ).rejects.toThrow('Add at least one artist.');
  });

  it('adds artist performances, removes duplicate rows, and syncs catalog', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.addArtistPerformances({
        shared: {
          artist: ' Faye Webster ',
        },
        performances: [
          {
            showName: ' Solo Show ',
            venue: ' Tabernacle ',
            city: ' Atlanta ',
            date: ' 2026-06-01 ',
            billing: '',
            tags: [' favorite '],
            genre: ' Indie Pop ',
            subGenre: '',
          },
          {
            showName: 'Solo Show',
            venue: 'Tabernacle',
            city: 'Atlanta',
            date: '2026-06-01',
            billing: '',
            tags: ['favorite'],
            genre: 'Indie Pop',
            subGenre: '',
          },
        ],
      });
    });

    expect(mockInsertMany).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({
        artist: 'Faye Webster',
        showName: 'Solo Show',
        venue: 'Tabernacle',
        city: 'Atlanta',
        tags: ['favorite'],
        showId: 'solo-show-2026-06-01',
      }),
    ]);

    expect(mockSyncCatalogOptions).toHaveBeenCalledWith('user-1', [
      {
        venue: 'Tabernacle',
        city: 'Atlanta',
        genre: 'Indie Pop',
        subGenre: '',
        billing: '',
        tags: ['favorite'],
      },
    ]);
  });

  it('validates add artist payloads and auth', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.addArtistPerformances({
        shared: { artist: 'Faye Webster' },
        performances: [],
      })
    ).rejects.toThrow('You must be logged in to add an artist.');

    await expect(
      result.current.addArtistPerformances({
        shared: { artist: '' },
        performances: [],
      })
    ).rejects.toThrow('Artist is required.');

    await expect(
      result.current.addArtistPerformances({
        shared: { artist: 'Faye Webster' },
        performances: [],
      })
    ).rejects.toThrow('Add at least one performance.');
  });

  it('prevents overlapping artist saves and resets after completion', async () => {
    let resolveInsertMany: () => void = () => undefined;

    mockInsertMany.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveInsertMany = resolve;
      })
    );

    const { result } = renderUsePerformanceActions();

    const payload = {
      shared: {
        artist: 'Faye Webster',
      },
      performances: [
        {
          showName: 'New Show',
          venue: '',
          city: '',
          date: '2026-08-01',
          billing: '',
          tags: [],
          genre: '',
          subGenre: '',
        },
      ],
    };

    const firstSave = result.current.addArtistPerformances(payload);

    await expect(result.current.addArtistPerformances(payload)).rejects.toThrow(
      'An artist save is already in progress.'
    );

    await act(async () => {
      resolveInsertMany();
      await firstSave;
    });

    await act(async () => {
      await result.current.addArtistPerformances({
        ...payload,
        performances: [{ ...payload.performances[0], showName: 'Another Show' }],
      });
    });

    expect(mockInsertMany).toHaveBeenCalledTimes(2);
  });

  it('updates artist performances by deleting removed rows, updating existing rows, inserting new rows, and syncing catalog', async () => {
    const { result } = renderUsePerformanceActions();

    await act(async () => {
      await result.current.updateArtistPerformances('Faye Webster', {
        shared: {
          artist: 'Faye W.',
        },
        performances: [
          {
            performanceId: 'p1',
            showName: 'Atlanta Show Updated',
            venue: 'Fox Theatre',
            city: 'Atlanta',
            date: '2026-05-02',
            billing: 'Headliner',
            tags: ['favorite'],
            genre: 'Indie Pop',
            subGenre: '',
          },
          {
            showName: 'New Artist Show',
            venue: 'Tabernacle',
            city: 'Atlanta',
            date: '2026-09-01',
            billing: '',
            tags: [],
            genre: 'Indie Pop',
            subGenre: '',
          },
        ],
      });
    });

    expect(mockDeleteMany).toHaveBeenCalledWith('user-1', ['p3']);

    expect(mockUpdateMany).toHaveBeenCalledWith('user-1', [
      {
        id: 'p1',
        performance: expect.objectContaining({
          artist: 'Faye W.',
          showName: 'Atlanta Show Updated',
          showId: 'atlanta-show-updated-2026-05-02',
        }),
      },
    ]);

    expect(mockInsertMany).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({
        artist: 'Faye W.',
        showName: 'New Artist Show',
        showId: 'new-artist-show-2026-09-01',
      }),
    ]);

    expect(mockSyncCatalogOptions).toHaveBeenCalled();
  });

  it('validates update artist payloads and auth', async () => {
    const { result } = renderUsePerformanceActions();
    const noUser = renderUsePerformanceActions({ user: null });

    await expect(
      noUser.result.current.updateArtistPerformances('Faye Webster', {
        shared: { artist: 'Faye Webster' },
        performances: [],
      })
    ).rejects.toThrow('You must be logged in to edit an artist.');

    await expect(
      result.current.updateArtistPerformances('Faye Webster', {
        shared: { artist: '' },
        performances: [],
      })
    ).rejects.toThrow('Artist is required.');

    await expect(
      result.current.updateArtistPerformances('Missing Artist', {
        shared: { artist: 'Missing Artist' },
        performances: [],
      })
    ).rejects.toThrow('Artist not found.');

    await expect(
      result.current.updateArtistPerformances('Faye Webster', {
        shared: { artist: 'Faye Webster' },
        performances: [],
      })
    ).rejects.toThrow('Add at least one performance.');
  });
});