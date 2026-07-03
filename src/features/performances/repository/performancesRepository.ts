import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../../auth/services/firebase';
import { Performance } from '../types/performance';

const USERS_COLLECTION = 'users';
const PERFORMANCES_COLLECTION = 'performances';
const BATCH_WRITE_LIMIT = 450;

type PerformanceDoc = Omit<Performance, 'id'> & {
  artistNormalized?: string;
  dateSortKey?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type PerformanceWritePayload = Omit<Performance, 'id'>;

type PerformanceUpdatePayload = {
  id: string;
  performance: PerformanceWritePayload;
};

function performancesCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, PERFORMANCES_COLLECTION);
}

function performanceDoc(userId: string, performanceId: string) {
  return doc(db, USERS_COLLECTION, userId, PERFORMANCES_COLLECTION, performanceId);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function toDateSortKey(date: string): string {
  const trimmedDate = date.trim();

  // Handles MM-DD-YY or MM-DD-YYYY
  const dashedParts = trimmedDate.split('-');

  if (dashedParts.length === 3) {
    const [month, day, year] = dashedParts;
    const fullYear = year.length === 2 ? `20${year}` : year;

    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Fallback for already-sortable dates like YYYY-MM-DD
  return trimmedDate;
}

function normalizePerformanceForWrite(performance: PerformanceWritePayload) {
  return {
    ...performance,
    artistNormalized: normalizeText(performance.artist),
    dateSortKey: toDateSortKey(performance.date),
  };
}

function mapPerformance(id: string, data: Partial<PerformanceDoc>): Performance {
  return {
    id,
    artist: data.artist ?? '',
    venue: data.venue ?? '',
    city: data.city ?? '',
    date: data.date ?? '',
    billing: data.billing ?? '',
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === 'string')
      : data.tags
      ? [data.tags]
      : [],
    genre: data.genre ?? '',
    subGenre: data.subGenre ?? '',
    showName: data.showName ?? '',
    showId: data.showId ?? '',
  };
}

function toCreateData(performance: PerformanceWritePayload) {
  return {
    ...normalizePerformanceForWrite(performance),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function toUpdateData(performance: PerformanceWritePayload) {
  return {
    ...normalizePerformanceForWrite(performance),
    updatedAt: serverTimestamp(),
  };
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function commitBatchChunks<T>(
  items: T[],
  writeChunk: (batch: ReturnType<typeof writeBatch>, chunk: T[]) => void
): Promise<void> {
  const chunks = chunkArray(items, BATCH_WRITE_LIMIT);

  for (const chunk of chunks) {
    if (chunk.length === 0) continue;

    const batch = writeBatch(db);
    writeChunk(batch, chunk);
    await batch.commit();
  }
}

export const performancesRepository = {
  async getAll(userId: string): Promise<Performance[]> {
    const snapshot = await getDocs(
      query(performancesCollection(userId), orderBy('dateSortKey', 'desc'))
    );

    return snapshot.docs.map((item) =>
      mapPerformance(item.id, item.data() as Partial<PerformanceDoc>)
    );
  },

  subscribe(
    userId: string,
    onData: (items: Performance[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(performancesCollection(userId), orderBy('dateSortKey', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapPerformance(item.id, item.data() as Partial<PerformanceDoc>)
        );

        onData(items);
      },
      (error) => onError?.(error)
    );
  },

  async insert(
    userId: string,
    performance: PerformanceWritePayload
  ): Promise<string> {
    const ref = doc(performancesCollection(userId));

    await setDoc(ref, toCreateData(performance));

    return ref.id;
  },

  async insertMany(
    userId: string,
    performances: PerformanceWritePayload[]
  ): Promise<string[]> {
    if (performances.length === 0) return [];

    const refs = performances.map(() => doc(performancesCollection(userId)));

    const rows = performances.map((performance, index) => ({
      ref: refs[index],
      performance,
    }));

    await commitBatchChunks(rows, (batch, chunk) => {
      chunk.forEach(({ ref, performance }) => {
        batch.set(ref, toCreateData(performance));
      });
    });

    return refs.map((ref) => ref.id);
  },

  async update(
    userId: string,
    performanceId: string,
    performance: PerformanceWritePayload
  ): Promise<void> {
    await updateDoc(performanceDoc(userId, performanceId), toUpdateData(performance));
  },

  async updateMany(
    userId: string,
    updates: PerformanceUpdatePayload[]
  ): Promise<void> {
    if (updates.length === 0) return;

    await commitBatchChunks(updates, (batch, chunk) => {
      chunk.forEach(({ id, performance }) => {
        batch.update(performanceDoc(userId, id), toUpdateData(performance));
      });
    });
  },

  async delete(userId: string, performanceId: string): Promise<void> {
    await deleteDoc(performanceDoc(userId, performanceId));
  },

  async deleteMany(userId: string, performanceIds: string[]): Promise<void> {
    if (performanceIds.length === 0) return;

    await commitBatchChunks(performanceIds, (batch, chunk) => {
      chunk.forEach((performanceId) => {
        batch.delete(performanceDoc(userId, performanceId));
      });
    });
  },

  async updateGenresByArtist(
    userId: string,
    artistName: string,
    genre: string,
    subGenre: string
  ): Promise<void> {
    const normalizedArtistName = normalizeText(artistName);

    if (!normalizedArtistName) return;

    const snapshot = await getDocs(
      query(
        performancesCollection(userId),
        where('artistNormalized', '==', normalizedArtistName)
      )
    );

    await commitBatchChunks(snapshot.docs, (batch, chunk) => {
      chunk.forEach((item) => {
        batch.update(item.ref, {
          genre,
          subGenre,
          updatedAt: serverTimestamp(),
        });
      });
    });
  },
};