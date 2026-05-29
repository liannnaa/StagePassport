import { renderHook, act } from '@testing-library/react-native';
import { useCatalogActions } from '../../features/performances/hooks/useCatalogActions';

const mockInsertVenue = jest.fn();
const mockDeleteVenue = jest.fn();
const mockInsertGenre = jest.fn();
const mockDeleteGenre = jest.fn();
const mockInsertSubGenre = jest.fn();
const mockDeleteSubGenre = jest.fn();
const mockInsertBilling = jest.fn();
const mockDeleteBilling = jest.fn();
const mockInsertTag = jest.fn();
const mockDeleteTag = jest.fn();
const mockUpdatePerformance = jest.fn();
const mockUpdateGenresByArtist = jest.fn();
const mockSyncCatalogOptions = jest.fn();

jest.mock('../../features/venues/repository/venueOptionsRepository', () => ({
  venueOptionsRepository: {
    insert: (...args: unknown[]) => mockInsertVenue(...args),
    deleteVenueOption: (...args: unknown[]) => mockDeleteVenue(...args),
  },
}));

jest.mock('../../features/genres/repository/genresRepository', () => ({
  genresRepository: {
    insertGenre: (...args: unknown[]) => mockInsertGenre(...args),
    deleteGenre: (...args: unknown[]) => mockDeleteGenre(...args),
    insertSubGenre: (...args: unknown[]) => mockInsertSubGenre(...args),
    deleteSubGenre: (...args: unknown[]) => mockDeleteSubGenre(...args),
  },
}));

jest.mock('../../features/billings/repository/billingsRepository', () => ({
  billingsRepository: {
    insert: (...args: unknown[]) => mockInsertBilling(...args),
    delete: (...args: unknown[]) => mockDeleteBilling(...args),
  },
}));

jest.mock('../../features/tags/repository/tagsRepository', () => ({
  tagsRepository: {
    insert: (...args: unknown[]) => mockInsertTag(...args),
    delete: (...args: unknown[]) => mockDeleteTag(...args),
  },
}));

jest.mock('../../features/performances/repository/performancesRepository', () => ({
  performancesRepository: {
    update: (...args: unknown[]) => mockUpdatePerformance(...args),
    updateGenresByArtist: (...args: unknown[]) =>
      mockUpdateGenresByArtist(...args),
  },
}));

jest.mock('../../features/performances/services/catalogSyncService', () => ({
  syncCatalogOptions: (...args: unknown[]) => mockSyncCatalogOptions(...args),
}));

const user = { uid: 'user-1' };

const performances = [
  {
    id: 'performance-1',
    artist: 'Faye Webster',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Headliner',
    tags: ['Favorite', 'Outdoor'],
    genre: 'Indie Pop',
    subGenre: 'Singer-songwriter',
    showId: 'atlanta-show-2026-05-01',
  },
  {
    id: 'performance-2',
    artist: 'Lomelda',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Support',
    tags: ['Favorite'],
    genre: 'Indie Pop',
    subGenre: 'Dream Pop',
    showId: 'atlanta-show-2026-05-01',
  },
];

const venueOptions = [
  {
    id: 'fox-theatre-atlanta',
    venueName: 'Fox Theatre',
    city: 'Atlanta',
    normalizedKey: 'fox-theatre-atlanta',
  },
];

const genreOptions = [
  {
    id: 'indie-pop',
    name: 'Indie Pop',
    normalizedName: 'indie pop',
  },
];

const subGenreOptions = [
  {
    id: 'singer-songwriter',
    genreId: 'indie-pop',
    name: 'Singer-songwriter',
    normalizedKey: 'indie pop::singer-songwriter',
  },
  {
    id: 'dream-pop',
    genreId: 'indie-pop',
    name: 'Dream Pop',
    normalizedKey: 'indie pop::dream pop',
  },
];

const billingOptions = [
  {
    id: 'headliner',
    name: 'Headliner',
    normalizedName: 'headliner',
  },
  {
    id: 'support',
    name: 'Support',
    normalizedName: 'support',
  },
];

const tagOptions = [
  {
    id: 'favorite',
    name: 'Favorite',
    normalizedName: 'favorite',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    normalizedName: 'outdoor',
  },
];

function renderUseCatalogActions(overrides = {}) {
  return renderHook(() =>
    useCatalogActions({
      user,
      performances,
      venueOptions,
      genreOptions,
      subGenreOptions,
      billingOptions,
      tagOptions,
      ...overrides,
    })
  );
}

describe('useCatalogActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockInsertVenue.mockResolvedValue({ id: 'new-venue' });
    mockInsertGenre.mockResolvedValue({ id: 'new-genre' });
    mockInsertSubGenre.mockResolvedValue({ id: 'new-sub-genre' });
    mockInsertBilling.mockResolvedValue({ id: 'new-billing' });
    mockInsertTag.mockResolvedValue({ id: 'new-tag' });
    mockUpdatePerformance.mockResolvedValue(undefined);
    mockUpdateGenresByArtist.mockResolvedValue(undefined);
    mockSyncCatalogOptions.mockResolvedValue(undefined);
  });

  it('adds and deletes catalog options when logged in', async () => {
    const { result } = renderUseCatalogActions();

    await act(async () => {
      await result.current.addVenueOption('Tabernacle', 'Atlanta');
      await result.current.deleteVenueOption('venue-1');
      await result.current.addGenreOption('Indie');
      await result.current.deleteGenreOption('genre-1');
      await result.current.addSubGenreOption('genre-1', 'Indie', 'Dream Pop');
      await result.current.deleteSubGenreOption('sub-genre-1');
      await result.current.addBillingOption('Headliner');
      await result.current.deleteBillingOption('billing-1');
      await result.current.addTagOption('Favorite');
      await result.current.deleteTagOption('tag-1');
    });

    expect(mockInsertVenue).toHaveBeenCalledWith('user-1', 'Tabernacle', 'Atlanta');
    expect(mockDeleteVenue).toHaveBeenCalledWith('user-1', 'venue-1');

    expect(mockInsertGenre).toHaveBeenCalledWith('user-1', 'Indie');
    expect(mockDeleteGenre).toHaveBeenCalledWith('user-1', 'genre-1');

    expect(mockInsertSubGenre).toHaveBeenCalledWith(
      'user-1',
      'genre-1',
      'Indie',
      'Dream Pop'
    );
    expect(mockDeleteSubGenre).toHaveBeenCalledWith('user-1', 'sub-genre-1');

    expect(mockInsertBilling).toHaveBeenCalledWith('user-1', 'Headliner');
    expect(mockDeleteBilling).toHaveBeenCalledWith('user-1', 'billing-1');

    expect(mockInsertTag).toHaveBeenCalledWith('user-1', 'Favorite');
    expect(mockDeleteTag).toHaveBeenCalledWith('user-1', 'tag-1');
  });

  it('throws when adding or deleting without a user', async () => {
    const { result } = renderUseCatalogActions({ user: null });

    await expect(result.current.addVenueOption('Venue', 'City')).rejects.toThrow(
      'You must be logged in to add a venue.'
    );

    await expect(result.current.deleteVenueOption('id')).rejects.toThrow(
      'You must be logged in to delete a venue.'
    );

    await expect(result.current.addGenreOption('Genre')).rejects.toThrow(
      'You must be logged in to add a genre.'
    );

    await expect(result.current.deleteGenreOption('id')).rejects.toThrow(
      'You must be logged in to delete a genre.'
    );

    await expect(
      result.current.addSubGenreOption('genre', 'Genre', 'Sub')
    ).rejects.toThrow('You must be logged in to add a sub-genre.');

    await expect(result.current.deleteSubGenreOption('id')).rejects.toThrow(
      'You must be logged in to delete a sub-genre.'
    );

    await expect(result.current.addBillingOption('Billing')).rejects.toThrow(
      'You must be logged in to add a billing.'
    );

    await expect(result.current.deleteBillingOption('id')).rejects.toThrow(
      'You must be logged in to delete a billing.'
    );

    await expect(result.current.addTagOption('Tag')).rejects.toThrow(
      'You must be logged in to add a tag.'
    );

    await expect(result.current.deleteTagOption('id')).rejects.toThrow(
      'You must be logged in to delete a tag.'
    );
  });

  it('checks whether catalog options are in use', () => {
    const { result } = renderUseCatalogActions();

    expect(result.current.isVenueOptionInUse('fox-theatre-atlanta')).toBe(true);
    expect(result.current.isVenueOptionInUse('missing')).toBe(false);

    expect(result.current.isGenreOptionInUse('indie-pop')).toBe(true);
    expect(result.current.isGenreOptionInUse('missing')).toBe(false);

    expect(result.current.isSubGenreOptionInUse('singer-songwriter')).toBe(true);
    expect(result.current.isSubGenreOptionInUse('missing')).toBe(false);

    expect(result.current.isBillingOptionInUse('headliner')).toBe(true);
    expect(result.current.isBillingOptionInUse('missing')).toBe(false);

    expect(result.current.isTagOptionInUse('favorite')).toBe(true);
    expect(result.current.isTagOptionInUse('Favorite')).toBe(true);
    expect(result.current.isTagOptionInUse('missing')).toBe(false);
  });

  it('returns genre and sub-genre helpers', () => {
    const { result } = renderUseCatalogActions();

    expect(result.current.getSubGenreOptionsByGenreId('indie-pop')).toEqual(
      subGenreOptions
    );

    expect(result.current.getAllSubGenreOptions()).toEqual(subGenreOptions);

    expect(result.current.getGenreById('indie-pop')).toEqual(genreOptions[0]);
    expect(result.current.getGenreById('missing')).toBeUndefined();
  });

  it('syncs genres for an artist when user and artist exist', async () => {
    const { result } = renderUseCatalogActions();

    await act(async () => {
      await result.current.syncGenresForArtist(
        ' Faye Webster ',
        ' Indie Pop ',
        ' Dream Pop '
      );
    });

    expect(mockUpdateGenresByArtist).toHaveBeenCalledWith(
      'user-1',
      'Faye Webster',
      'Indie Pop',
      'Dream Pop'
    );

    expect(mockSyncCatalogOptions).toHaveBeenCalledWith('user-1', [
      {
        venue: '',
        city: '',
        genre: 'Indie Pop',
        subGenre: 'Dream Pop',
        billing: '',
        tags: [],
      },
    ]);
  });

  it('does not sync genres without a user or artist', async () => {
    const withoutUser = renderUseCatalogActions({ user: null });
    const withUser = renderUseCatalogActions();

    await act(async () => {
      await withoutUser.result.current.syncGenresForArtist(
        'Faye Webster',
        'Indie',
        'Pop'
      );
      await withUser.result.current.syncGenresForArtist('', 'Indie', 'Pop');
    });

    expect(mockUpdateGenresByArtist).not.toHaveBeenCalled();
    expect(mockSyncCatalogOptions).not.toHaveBeenCalled();
  });

  it('gets catalog usage by type', () => {
    const { result } = renderUseCatalogActions();

    expect(
      result.current.getCatalogUsage('billing', 'headliner').map((item) => item.id)
    ).toEqual(['performance-1']);

    expect(
      result.current.getCatalogUsage('tag', 'favorite').map((item) => item.id)
    ).toEqual(['performance-1', 'performance-2']);

    expect(
      result.current
        .getCatalogUsage('venue', 'fox-theatre-atlanta')
        .map((item) => item.id)
    ).toEqual(['performance-1', 'performance-2']);

    expect(
      result.current.getCatalogUsage('genre', 'indie-pop').map((item) => item.id)
    ).toEqual(['performance-1', 'performance-2']);

    expect(
      result.current
        .getCatalogUsage('subGenre', 'singer-songwriter')
        .map((item) => item.id)
    ).toEqual(['performance-1']);
  });

  it('removes catalog values from a performance', async () => {
    const { result } = renderUseCatalogActions();

    await act(async () => {
      await result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'billing'
      );
      await result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'tag',
        'favorite'
      );
      await result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'venue'
      );
      await result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'genre'
      );
      await result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'subGenre'
      );
    });

    expect(mockUpdatePerformance).toHaveBeenCalledTimes(5);

    expect(mockUpdatePerformance).toHaveBeenNthCalledWith(
      1,
      'user-1',
      'performance-1',
      expect.objectContaining({
        billing: '',
        tags: ['Favorite', 'Outdoor'],
      })
    );

    expect(mockUpdatePerformance).toHaveBeenNthCalledWith(
      2,
      'user-1',
      'performance-1',
      expect.objectContaining({
        billing: 'Headliner',
        tags: ['Outdoor'],
      })
    );

    expect(mockUpdatePerformance).toHaveBeenNthCalledWith(
      3,
      'user-1',
      'performance-1',
      expect.objectContaining({
        venue: '',
        city: '',
      })
    );

    expect(mockUpdatePerformance).toHaveBeenNthCalledWith(
      4,
      'user-1',
      'performance-1',
      expect.objectContaining({
        genre: '',
        subGenre: '',
      })
    );

    expect(mockUpdatePerformance).toHaveBeenNthCalledWith(
      5,
      'user-1',
      'performance-1',
      expect.objectContaining({
        genre: 'Indie Pop',
        subGenre: '',
      })
    );
  });

  it('throws when removing catalog values without user or performance', async () => {
    const withoutUser = renderUseCatalogActions({ user: null });
    const withUser = renderUseCatalogActions();

    await expect(
      withoutUser.result.current.removeCatalogValueFromPerformance(
        'performance-1',
        'billing'
      )
    ).rejects.toThrow('You must be logged in to update a performance.');

    await expect(
      withUser.result.current.removeCatalogValueFromPerformance(
        'missing',
        'billing'
      )
    ).rejects.toThrow('Performance not found.');
  });

  it('replaces catalog values across usage', async () => {
    const { result } = renderUseCatalogActions();

    await act(async () => {
      await result.current.replaceCatalogValue('billing', 'headliner', {
        billing: 'Main',
      });

      await result.current.replaceCatalogValue('tag', 'favorite', {
        tag: 'Loved',
      });

      await result.current.replaceCatalogValue('venue', 'fox-theatre-atlanta', {
        venue: 'Tabernacle',
        city: 'Atlanta',
      });

      await result.current.replaceCatalogValue('genre', 'indie-pop', {
        genre: 'Alternative',
      });

      await result.current.replaceCatalogValue('subGenre', 'singer-songwriter', {
        subGenre: 'Folk Pop',
      });
    });

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-1',
      expect.objectContaining({ billing: 'Main' })
    );

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-1',
      expect.objectContaining({ tags: ['Loved', 'Outdoor'] })
    );

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-2',
      expect.objectContaining({ tags: ['Loved'] })
    );

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-1',
      expect.objectContaining({
        venue: 'Tabernacle',
        city: 'Atlanta',
      })
    );

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-1',
      expect.objectContaining({
        genre: 'Alternative',
        subGenre: '',
      })
    );

    expect(mockUpdatePerformance).toHaveBeenCalledWith(
      'user-1',
      'performance-1',
      expect.objectContaining({
        subGenre: 'Folk Pop',
      })
    );

    expect(mockSyncCatalogOptions).toHaveBeenCalled();
  });

  it('throws when replacing catalog values without a user', async () => {
    const { result } = renderUseCatalogActions({ user: null });

    await expect(
      result.current.replaceCatalogValue('billing', 'headliner', {
        billing: 'Main',
      })
    ).rejects.toThrow('You must be logged in to update catalog usage.');
  });
});