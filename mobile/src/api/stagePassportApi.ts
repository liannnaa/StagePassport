import { auth } from '../features/auth/services/firebase';
import { Performance } from '../features/performances/types/performance';
import { PerformancePayload, CatalogSyncRow, CatalogReplacement, CatalogType } from '../features/performances/types/performanceContextTypes';
import { buildShowId } from '../features/performances/utils/showId';
import { VenueOption } from '../features/venues/types/venue';
import { GenreOption, SubGenreOption } from '../features/genres/types/genre';
import { BillingOption } from '../features/billings/types/billing';
import { TagOption } from '../features/tags/types/tag';

export type CatalogResponse = {
  venues: VenueOption[];
  billings: BillingOption[];
  tags: TagOption[];
  genres: GenreOption[];
  subGenres: SubGenreOption[];
};

const API_URL = 'http://192.168.1.94:8080';

export async function getPerformancesFromApi(): Promise<Performance[]> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch performances: ${res.status}`);
  }

  return res.json();
}

export async function createPerformanceFromApi(payload: PerformancePayload): Promise<Performance> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const performance = {
    ...payload,
    showId: buildShowId(payload.showName, payload.date),
  };

  const res = await fetch(`${API_URL}/api/performances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(performance),
  });

  if (!res.ok) {
    throw new Error(`Failed to create performance: ${res.status}`);
  }

  return res.json();
}

export async function createPerformancesBatchFromApi(payloads: Array<Omit<Performance, 'id'>>): Promise<Performance[]> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payloads),
  });

  if (!res.ok) {
    throw new Error(`Failed to create performances batch: ${res.status}`);
  }

  return res.json();
}

export async function updatePerformanceFromApi(performanceId: string, payload: PerformancePayload): Promise<void> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const performance = {
    ...payload,
    showId: buildShowId(payload.showName, payload.date),
  };

  const res = await fetch(`${API_URL}/api/performances/${performanceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(performance),
  });

  if (!res.ok) {
    throw new Error(`Failed to update performance: ${res.status}`);
  }
}

export async function deletePerformanceFromApi(performanceId: string): Promise<void> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/${performanceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete performance: ${res.status}`);
  }
}

export async function updatePerformancesBatchFromApi(
    updates: Array<{
      id: string;
      performance: Omit<Performance, 'id'>;
    }>
  ): Promise<Performance[]> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/batch`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`Failed to update performances batch: ${res.status}`);
  }

  return res.json();
}

export async function deletePerformancesBatchFromApi(
    performanceIds: string[]
  ): Promise<void> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/batch`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(performanceIds),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete performances batch: ${res.status}`);
  }
}

export async function getCatalogFromApi(): Promise<CatalogResponse> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/catalog`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status}`);
  }

  return res.json();
}

export async function createBillingFromApi(name: string): Promise<BillingOption> {
  return createCatalogItem('/api/catalog/billings', { name });
}

export async function createTagFromApi(name: string): Promise<TagOption> {
  return createCatalogItem('/api/catalog/tags', { name });
}

export async function createGenreFromApi(name: string): Promise<GenreOption> {
  return createCatalogItem('/api/catalog/genres', { name });
}

export async function createVenueFromApi(
  venueName: string,
  city: string
): Promise<VenueOption> {
  return createCatalogItem('/api/catalog/venues', { venueName, city });
}

export async function createSubGenreFromApi(
  genreId: string,
  genreName: string,
  name: string
): Promise<SubGenreOption> {
  return createCatalogItem('/api/catalog/subgenres', {
    genreId,
    genreName,
    name,
  });
}

async function createCatalogItem<T>(path: string, body: unknown): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to create catalog item: ${res.status}`);
  }

  return res.json();
}

export async function syncCatalogFromApi(
  rows: CatalogSyncRow[]
): Promise<CatalogResponse> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/catalog/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    throw new Error(`Failed to sync catalog: ${res.status}`);
  }

  return res.json();
}

async function deleteCatalogItem(path: string): Promise<void> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) throw new Error('User is not authenticated.');

  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete catalog item: ${res.status}`);
  }
}

export function deleteVenueFromApi(id: string) {
  return deleteCatalogItem(`/api/catalog/venues/${id}`);
}

export function deleteBillingFromApi(id: string) {
  return deleteCatalogItem(`/api/catalog/billings/${id}`);
}

export function deleteTagFromApi(id: string) {
  return deleteCatalogItem(`/api/catalog/tags/${id}`);
}

export function deleteGenreFromApi(id: string) {
  return deleteCatalogItem(`/api/catalog/genres/${id}`);
}

export function deleteSubGenreFromApi(id: string) {
  return deleteCatalogItem(`/api/catalog/subgenres/${id}`);
}

export async function replaceCatalogValueFromApi(type: CatalogType, oldId: string, replacement: CatalogReplacement): Promise<{
    performances: Performance[];
    catalog: CatalogResponse;
  }> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) throw new Error('User is not authenticated.');

  const res = await fetch(`${API_URL}/api/catalog/replace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, oldId, replacement }),
  });

  if (!res.ok) {
    throw new Error(`Failed to replace catalog value: ${res.status}`);
  }

  return res.json();
}

export async function syncArtistGenresFromApi(
  artistName: string,
  genre: string,
  subGenre: string
): Promise<{
  performances: Performance[];
  catalog: CatalogResponse;
}> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/artist/genres`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      artistName,
      genre,
      subGenre,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to sync artist genres: ${res.status}`);
  }

  return res.json();
}